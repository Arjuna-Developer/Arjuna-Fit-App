// ═══════════════════════════════════════════════════════════════
// ArjunaFit — Payment Webhook Handler (Hotmart)
// Recibe eventos de pago, valida y activa acceso en Supabase.
// ═══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://egswsqymkxmbtcpnozcq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service key — never expose to frontend

// ── Product catalog (source of truth) ──────────────────────────
const PRODUCT_CATALOG = {
  challenge_glutes:   { name: 'Reto de glúteos',            expectedAmount: 32, currency: 'USD', trialDays: 7,  billing: 'one_time' },
  challenge_belly:    { name: 'Reto para bajar la pancita', expectedAmount: 32, currency: 'USD', trialDays: 7,  billing: 'one_time' },
  custom_muscle_gain: { name: 'Aumento de masa muscular',   expectedAmount: 72, currency: 'USD', trialDays: 0,  billing: 'monthly'  },
  custom_fat_loss:    { name: 'Reducción de % graso',       expectedAmount: 72, currency: 'USD', trialDays: 0,  billing: 'monthly'  },
};

// ── Map Hotmart product IDs to our product types ────────────────
// UPDATE THESE with real Hotmart product IDs when available
const HOTMART_PRODUCT_MAP = {
  // ── Productos ACTIVOS ─────────────────────────────────────
  '7678934': { product: 'challenge_belly',    name: 'Reto Pancita' },
  '6998679': { product: 'challenge_glutes',   name: 'Reto Glúteos' },
  '7678979': { product: 'custom_plan',        name: 'Plan Personalizado Virtual' }, // cubre masa + definición
};

// Expected amounts by product (for validation)
const EXPECTED_AMOUNTS = {
  challenge_glutes:   32,
  challenge_belly:    32,
  custom_muscle_gain: 72,
  custom_fat_loss:    72,
};

// ── Hotmart webhook signature validation ────────────────────────
function validateHotmartSignature(body, signature, secret) {
  if (!secret) return true; // Skip validation if no secret configured (dev mode)
  const crypto = require('crypto');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return signature === expected;
}

// ── Normalize event from different payment providers ─────────────
function normalizeEvent(body, provider) {
  // Hotmart webhook format
  if (provider === 'hotmart') {
    const event = body.event;
    const data = body.data || {};
    const buyer = data.buyer || {};
    const purchase = data.purchase || {};
    const product = data.product || {};

    // Determine our product type from Hotmart product ID
    const hotmartProductId = product.id || product.product_id || '';
    const productType = HOTMART_PRODUCT_MAP[hotmartProductId] || 
                        guessProductFromAmount(purchase.price?.value);

    return {
      event: event,
      status: mapHotmartStatus(event),
      email: buyer.email || '',
      name: buyer.name || '',
      productId: hotmartProductId,
      productType: productType,
      amount: purchase.price?.value || 0,
      currency: purchase.price?.currency_value || 'USD',
      transactionId: purchase.transaction || purchase.order_date || '',
      provider: 'hotmart',
      rawPayload: body,
    };
  }

  // Generic fallback
  return {
    status: body.status || 'unknown',
    email: body.email || body.customer?.email || '',
    name: body.customer?.name || '',
    productType: body.product_type || body.metadata?.product_type || '',
    amount: parseFloat(body.amount || 0),
    currency: body.currency || 'USD',
    transactionId: body.transaction_id || body.payment_id || '',
    provider: provider,
    rawPayload: body,
  };
}

function mapHotmartStatus(event) {
  const map = {
    'PURCHASE_APPROVED':      'approved',
    'PURCHASE_COMPLETE':      'approved',
    'PURCHASE_BILLET_PRINTED':'pending',
    'PURCHASE_WAITING_PAYMENT':'pending',
    'PURCHASE_CANCELLED':     'cancelled',
    'PURCHASE_REFUNDED':      'refunded',
    'PURCHASE_CHARGEBACK':    'refunded',
    'PURCHASE_PROTEST':       'needs_review',
    'PURCHASE_DELAYED':       'pending',
  };
  return map[event] || 'unknown';
}

function guessProductFromAmount(amount) {
  // DESHABILITADO: nunca adivinar producto por monto
  // Siempre usar HOTMART_PRODUCT_MAP con IDs reales
  console.warn('[Webhook] No product ID found — sending to needs_review. Amount:', amount);
  return null;
}

// ── Validate payment against catalog ────────────────────────────
function validatePayment(normalized) {
  const catalog = PRODUCT_CATALOG[normalized.productType];
  if (!catalog) return { valid: false, reason: 'unknown_product' };

  const amountMatch = Math.abs(normalized.amount - catalog.expectedAmount) < 1;
  if (!amountMatch) return { valid: false, reason: 'amount_mismatch', expected: catalog.expectedAmount, received: normalized.amount };

  if (normalized.currency !== catalog.currency) return { valid: false, reason: 'currency_mismatch' };

  return { valid: true, catalog };
}

// ── Supabase operations ─────────────────────────────────────────
async function upsertPayment(sb, normalized, validation) {
  const paymentData = {
    email: normalized.email,
    product_type: normalized.productType,
    product_name: PRODUCT_CATALOG[normalized.productType]?.name || normalized.productType,
    amount: normalized.amount,
    currency: normalized.currency,
    provider: normalized.provider,
    provider_payment_id: normalized.transactionId,
    status: validation.valid ? normalized.status : 'needs_review',
    raw_payload_json: JSON.stringify(normalized.rawPayload),
    validated_at: validation.valid ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  // Check for duplicate
  const { data: existing } = await sb
    .from('payments')
    .select('id, status')
    .eq('provider_payment_id', normalized.transactionId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'approved') {
      return { isDuplicate: true, paymentId: existing.id };
    }
    await sb.from('payments').update(paymentData).eq('id', existing.id);
    return { isDuplicate: false, paymentId: existing.id };
  }

  const { data, error } = await sb.from('payments').insert(paymentData).select('id').single();
  if (error) throw error;
  return { isDuplicate: false, paymentId: data.id };
}

async function findOrCreateUser(sb, email, name, productType) {
  // Find user by email in auth
  const { data: users } = await sb.auth.admin.listUsers();
  const existing = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    return { userId: existing.id, isNew: false };
  }

  // User doesn't exist — create provisional profile record
  // They'll complete auth via magic link or complete-account page
  const { data: profile, error } = await sb
    .from('profiles')
    .upsert({
      email: email,
      full_name: name || email.split('@')[0],
      product_type: productType,
      subscription_status: 'pending_password_setup',
      account_status: 'pending_password_setup',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email', ignoreDuplicates: false })
    .select('id')
    .single();

  if (error) {
    console.error('Profile upsert error:', error);
    return { userId: null, isNew: true };
  }

  return { userId: profile?.id || null, isNew: true };
}

async function activateProduct(sb, userId, productType, catalog, paymentId) {
  if (!userId) return;

  const now = new Date().toISOString();
  const updateData = {
    product_type: productType,
    subscription_status: 'active',
    access_level: 'full',
    is_trial: false,
    paid_amount: catalog.expectedAmount,
    currency: catalog.currency,
    payment_id: paymentId,
    activated_at: now,
    updated_at: now,
  };

  // For reto types — set total_days
  if (productType.startsWith('challenge_')) {
    updateData.total_days = 37;
    // Don't reset current_day — preserve trial progress
  }

  await sb.from('profiles').update(updateData).eq('id', userId);
}

async function joinCommunity(sb, userId, email) {
  if (!userId && !email) return;

  const memberData = {
    community_id: 'free_arjunafit_community',
    community_name: 'Comunidad gratuita ArjunaFit',
    membership_type: 'free',
    status: 'active',
    joined_at: new Date().toISOString(),
    source: 'payment_approved',
    created_at: new Date().toISOString(),
  };

  if (userId) memberData.user_id = userId;
  if (email) memberData.email = email;

  // Idempotent — check if already member
  const query = userId
    ? sb.from('community_memberships').select('id').eq('user_id', userId).eq('community_id', 'free_arjunafit_community')
    : sb.from('community_memberships').select('id').eq('email', email).eq('community_id', 'free_arjunafit_community');

  const { data: existing } = await query.maybeSingle();
  if (!existing) {
    await sb.from('community_memberships').insert(memberData);
  }
}

async function sendMagicLink(sb, email, productType) {
  // Send Supabase magic link for new users to complete account setup
  try {
    await sb.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `https://arjunafit.app/complete-account?product=${productType}`,
      },
    });
    console.log('[Webhook] Magic link sent to:', email);
  } catch(e) {
    console.error('[Webhook] Magic link error:', e.message);
  }
}

// ── Main handler ────────────────────────────────────────────────
// ── Log reconciliation issue ────────────────────────────────────
async function logReconciliation(sb, paymentId, issueType, description, userId) {
  try {
    await sb.from('payment_reconciliation_logs').insert({
      payment_id:  paymentId || null,
      user_id:     userId || null,
      issue_type:  issueType,
      description: description,
      status:      'open',
      created_at:  new Date().toISOString(),
    });
    console.log('[Reconciliation] Issue logged:', issueType, description);
  } catch(e) {
    console.error('[Reconciliation] Could not log issue:', e.message);
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', service: 'ArjunaFit Payment Webhook' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // ── Parse body ────────────────────────────────
    let body;
    try { body = JSON.parse(event.body); } catch(e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    // ── Validate Hotmart signature ────────────────
    const signature = event.headers['x-hotmart-signature'] || event.headers['X-Hotmart-Signature'] || '';
    const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET || '';
    if (!validateHotmartSignature(event.body, signature, webhookSecret)) {
      console.warn('[Webhook] Invalid signature');
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
    }

    // ── Determine provider ────────────────────────
    const provider = event.headers['x-hotmart-signature'] ? 'hotmart' : 'generic';
    const normalized = normalizeEvent(body, provider);

    console.log('[Webhook] Event:', normalized.event, '| Status:', normalized.status, '| Email:', normalized.email);

    // ── Init Supabase ─────────────────────────────
    if (!SUPABASE_SERVICE_KEY) {
      console.error('[Webhook] SUPABASE_SERVICE_ROLE_KEY not configured');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
    }
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Validate payment ──────────────────────────
    const validation = validatePayment(normalized);

    // ── Record payment ────────────────────────────
    const { isDuplicate, paymentId } = await upsertPayment(sb, normalized, validation);
    if (isDuplicate) {
      console.log('[Webhook] Duplicate payment ignored:', normalized.transactionId);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'duplicate_ignored' }) };
    }

    // ── Only process approved payments ───────────
    if (normalized.status !== 'approved') {
      console.log('[Webhook] Non-approved status, no activation:', normalized.status);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'recorded', payment_status: normalized.status }) };
    }

    // ── Validation failed → mark needs_review + reconciliation log ──
    if (!validation.valid) {
      console.warn('[Webhook] Payment validation failed:', validation.reason, '| Marked needs_review');
      await logReconciliation(sb, paymentId, 'invalid_amount',
        'Expected ' + (validation.expected || '?') + ' ' + normalized.currency + ', received ' + normalized.amount + ' | Reason: ' + validation.reason,
        null);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'needs_review', reason: validation.reason }) };
    }

    // ── Guard: null productType → needs_review ──────
    if (!normalized.productType) {
      console.warn('[Webhook] productType is null — HOTMART_PRODUCT_MAP not configured. Marking needs_review.');
      await logReconciliation(sb, paymentId, 'unknown_product',
        'Payment from ' + normalized.email + ' — product ID not in HOTMART_PRODUCT_MAP. Manual review required.',
        null);
      return { statusCode: 200, headers, body: JSON.stringify({
        status: 'needs_review',
        reason: 'product_id_not_configured',
        email: normalized.email,
        hotmart_product_id: normalized.productId
      })};
    }

    // ── Find or create user ───────────────────────
    const { userId, isNew } = await findOrCreateUser(sb, normalized.email, normalized.name, normalized.productType);

    // ── Activate product ──────────────────────────
    if (userId) {
      await activateProduct(sb, userId, normalized.productType, validation.catalog, paymentId);
      console.log('[Webhook] Product activated for userId:', userId);
    }

    // ── Join community ────────────────────────────
    await joinCommunity(sb, userId, normalized.email);
    console.log('[Webhook] Community joined for:', normalized.email);
    // Log reconciliation if no user found
    if (!userId && paymentId) {
      await logReconciliation(sb, paymentId, 'missing_user',
        'Payment approved for ' + normalized.email + ' — no Supabase user found. Magic link sent.',
        null);
    }

    // ── Send magic link if new user ───────────────
    if (isNew && normalized.email) {
      await sendMagicLink(sb, normalized.email, normalized.productType);
    }

    console.log('[Webhook] ✅ Complete. isNew:', isNew, '| product:', normalized.productType);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        product_activated: normalized.productType,
        is_new_user: isNew,
        community_joined: true,
      }),
    };

  } catch(err) {
    console.error('[Webhook] Error:', err.message, err.stack);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

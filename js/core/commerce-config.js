// ═══════════════════════════════════════════════════════
// ArjunaFit — Commerce Config v2
// Fuente única de verdad comercial.
// Para activar links reales: actualizar checkoutUrls.
// ═══════════════════════════════════════════════════════
(function() {
  'use strict';

  // ── Catálogo de productos ──────────────────────────────
  var PRODUCTS = {
    challenge_glutes: {
      id:           'challenge_glutes',
      name:         'Reto de glúteos',
      type:         'challenge',
      icon:         '🍑',
      trialDays:    7,
      price:        32,
      billing:      'one_time',
      currency:     'USD',
      priceLabel:   '$32 USD',
      billingLabel: '7 días gratis · luego $32 USD',
      ctaLabel:     'Crear cuenta y empezar gratis',
      paywallCta:   'Desbloquear reto por $32 USD →',
      checkoutUrl:  null,  // ← Hotmart reto glúteos cuando esté listo
    },
    challenge_belly: {
      id:           'challenge_belly',
      name:         'Reto para bajar la pancita',
      type:         'challenge',
      icon:         '🔥',
      trialDays:    7,
      price:        32,
      billing:      'one_time',
      currency:     'USD',
      priceLabel:   '$32 USD',
      billingLabel: '7 días gratis · luego $32 USD',
      ctaLabel:     'Crear cuenta y empezar gratis',
      paywallCta:   'Desbloquear reto por $32 USD →',
      checkoutUrl:  null,  // ← Hotmart reto pancita cuando esté listo
    },
    custom_muscle_gain: {
      id:           'custom_muscle_gain',
      name:         'Aumento de masa muscular',
      type:         'custom',
      icon:         '💪',
      trialDays:    0,
      price:        72,
      billing:      'monthly',
      currency:     'USD',
      priceLabel:   '$72 USD/mes',
      billingLabel: '$72 USD/mes · pago inmediato · sin prueba gratis',
      ctaLabel:     'Crear cuenta y continuar al pago',
      paywallCta:   'Pagar y empezar →',
      checkoutUrl:  'https://pay.hotmart.com/M105694336W?bid=1777962608286',
    },
    custom_fat_loss: {
      id:           'custom_fat_loss',
      name:         'Reducción de porcentaje graso',
      type:         'custom',
      icon:         '⚡',
      trialDays:    0,
      price:        72,
      billing:      'monthly',
      currency:     'USD',
      priceLabel:   '$72 USD/mes',
      billingLabel: '$72 USD/mes · pago inmediato · sin prueba gratis',
      ctaLabel:     'Crear cuenta y continuar al pago',
      paywallCta:   'Pagar y empezar →',
      checkoutUrl:  'https://pay.hotmart.com/M105694336W',
    },
  };

  var VALID_PRODUCTS = Object.keys(PRODUCTS);

  // ── Fallback contact ────────────────────────────────────
  var FALLBACK_WHATSAPP = '573209497919'; // ← CAMBIAR por número real de Arjuna

  // ── getProductConfig ────────────────────────────────────
  function getProductConfig(productId) {
    return PRODUCTS[productId] || null;
  }

  // ── isValidProduct ──────────────────────────────────────
  function isValidProduct(productId) {
    return VALID_PRODUCTS.includes(productId);
  }

  // ── hasTrial ────────────────────────────────────────────
  function hasTrial(productId) {
    var p = PRODUCTS[productId];
    return p ? p.trialDays > 0 : false;
  }

  // ── getCheckoutUrl ──────────────────────────────────────
  function getCheckoutUrl(productId) {
    var type = productId || localStorage.getItem('af-product-type') || 'challenge_glutes';
    var p = PRODUCTS[type];
    return (p && p.checkoutUrl) || null;
  }

  // ── handleCommercialAction (central handler) ─────────────
  function handleCommercialAction(productId, opts) {
    opts = opts || {};
    var type = productId || localStorage.getItem('af-product-type') || 'challenge_glutes';
    var p = PRODUCTS[type];
    if (!p) { console.warn('[AF Commerce] Invalid product:', type); return; }

    if (window.AF) AF.track('commercial_cta_clicked', {
      product: type, product_name: p.name, product_type: p.type,
      price: p.price, currency: p.currency,
      checkout_url_exists: !!p.checkoutUrl,
      source_route: window.location.pathname,
      cta_label: opts.ctaLabel || p.paywallCta,
    });

    if (p.checkoutUrl) {
      window.open(p.checkoutUrl, '_blank');
      if (window.AF) AF.track('checkout_clicked', { product: type, url: p.checkoutUrl });
    } else {
      if (window.AF) AF.track('checkout_missing_url', { product: type });
      showActivationModal(type, p);
    }
  }

  // ── Activation modal ────────────────────────────────────
  function showActivationModal(productId, p) {
    var existing = document.getElementById('activation-modal');
    if (existing) existing.remove();

    p = p || PRODUCTS[productId] || { name: 'tu plan', priceLabel: '' };

    var hasWa = FALLBACK_WHATSAPP && FALLBACK_WHATSAPP !== '573209497919';
    var waMsg = encodeURIComponent('Hola Arjuna! Quiero activar ' + p.name + ' en ArjunaFit (' + p.priceLabel + ').');
    var waUrl = 'https://wa.me/' + FALLBACK_WHATSAPP + '?text=' + waMsg;

    var ov = document.createElement('div');
    ov.id = 'activation-modal';
    ov.style.cssText = 'position:fixed;inset:0;z-index:800;background:rgba(8,5,17,.97);display:flex;align-items:center;justify-content:center;padding:24px;font-family:\'Outfit\',sans-serif';

    var contactHtml = hasWa
      ? '<a href="' + waUrl + '" target="_blank" id="am-wa" style="display:block;padding:14px;border-radius:14px;background:#25D366;color:#fff;font-family:Outfit,sans-serif;font-size:14px;font-weight:800;text-decoration:none;text-align:center;margin-bottom:10px;box-shadow:0 4px 20px rgba(37,211,102,.25)">💬 Hablar con Arjuna</a>'
      : '<div style="font-size:12px;color:rgba(255,255,255,.35);text-align:center;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);border-radius:12px">Contacto próximamente disponible.</div>';

    ov.innerHTML =
      '<div style="max-width:360px;width:100%;text-align:center">' +
        '<div style="font-size:40px;margin-bottom:14px">🔓</div>' +
        '<div style="font-size:19px;font-weight:800;color:#f1f0f4;margin-bottom:8px">' + p.name + '</div>' +
        '<div style="display:inline-block;padding:4px 14px;background:rgba(124,58,237,.15);border:1px solid rgba(196,181,253,.2);border-radius:12px;font-size:13px;font-weight:700;color:#c4b5fd;margin-bottom:18px">' + p.priceLabel + '</div>' +
        '<p style="font-size:13px;color:rgba(255,255,255,.5);line-height:1.75;margin-bottom:22px">' +
          'Estamos terminando de conectar el pago automático.<br>' +
          'Puedes hablar con Arjuna para activar tu acceso hoy.<br>' +
          '<span style="color:rgba(52,211,153,.7)">Tu progreso se guarda.</span>' +
        '</p>' +
        contactHtml +
        '<button id="am-close" style="width:100%;padding:12px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.4);font-family:Outfit,sans-serif;font-size:13px;cursor:pointer">Volver</button>' +
      '</div>';

    document.body.appendChild(ov);

    if (hasWa) {
      document.getElementById('am-wa').addEventListener('click', function() {
        localStorage.setItem('af-subscription-status', 'pending_manual_activation');
        localStorage.setItem('af-pending-product', productId || '');
        if (window.AF) AF.track('manual_activation_clicked', { product: productId });
      });
    }

    document.getElementById('am-close').addEventListener('click', function() { ov.remove(); });
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });

    if (window.AF) AF.track('manual_activation_modal_opened', { product: productId });
  }

  // ── isPendingActivation ─────────────────────────────────
  function isPendingActivation() {
    return localStorage.getItem('af-subscription-status') === 'pending_manual_activation';
  }

  // ── currentProductConfig ────────────────────────────────
  function currentProductConfig() {
    var type = localStorage.getItem('af-product-type') || '';
    return PRODUCTS[type] || null;
  }

  // ── Console log ─────────────────────────────────────────
  console.log('[AF Commerce] v2 — Retos: $32 USD | Planes: $72 USD/mes | Hotmart: planes activos, retos pendientes');

  // ── Expose ──────────────────────────────────────────────
  window.AF_Commerce = {
    PRODUCTS,
    VALID_PRODUCTS,
    getProductConfig,
    isValidProduct,
    hasTrial,
    getCheckoutUrl,
    openCheckout:          handleCommercialAction,  // alias
    handleCommercialAction,
    showActivationModal,
    isPendingActivation,
    currentProductConfig,
    config: { fallbackWhatsApp: FALLBACK_WHATSAPP },
  };

})();

// ── Support & admin config ───────────────────────────────────────
// Admin email: arjuna.desarrollador@gmail.com
// Passwords are NEVER stored in code — use Supabase Auth only
// ═══════════════════════════════════════════════════════
// ⚠️ CONFIGURAR ANTES DE BETA — WhatsApp y soporte
// ═══════════════════════════════════════════════════════

// 🔴 ACCIÓN REQUERIDA: Reemplaza este número por el tuyo real
// Formato: código de país + número sin espacios ni +
// Ejemplo Colombia: 573XXXXXXXXX
var WHATSAPP_NUMBER = '573209497919'; // Número real ArjunaFit

window.AF_Support = {
  supportEmail:   'arjuna.desarrollador@gmail.com',
  supportLabel:   'Soporte ArjunaFit',
  supportMailto:  'mailto:arjuna.desarrollador@gmail.com',
  adminEmail:     'arjuna.desarrollador@gmail.com',
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl:    'https://wa.link/hteek6', // Link personalizado ArjunaFit
  isPlaceholder:  false,

  // Open support: creates ticket if logged in, else mailto
  openSupport: function(category) {
    var uid = localStorage.getItem('af-user-id');
    if (uid && window.location) {
      window.location.href = '/pages/help.html?cat=' + (category || '');
    } else {
      var body = encodeURIComponent('Hola, necesito ayuda con ArjunaFit.' + (category ? ' Categoría: ' + category : ''));
      window.open('mailto:arjuna.desarrollador@gmail.com?subject=Soporte+ArjunaFit&body=' + body, '_blank');
    }
    if (window.AF) AF.track('support_contact_clicked', { method: uid ? 'in_app' : 'mailto', category: category });
  },

  // Check if current user is admin (reads from localStorage after login)
  isAdmin: function() {
    return localStorage.getItem('af-is-admin') === '1' ||
           localStorage.getItem('af-role') === 'admin';
  },

  // Load admin status from Supabase profile (call after login)
  loadAdminStatus: async function(supabaseClient, userId) {
    if (!supabaseClient || !userId) return false;
    try {
      var { data } = await supabaseClient
        .from('profiles')
        .select('is_admin, role, email')
        .eq('id', userId)
        .maybeSingle();
      var admin = data && (data.is_admin === true || data.role === 'admin');
      localStorage.setItem('af-is-admin', admin ? '1' : '0');
      localStorage.setItem('af-role', data?.role || 'user');
      if (data?.email) localStorage.setItem('af-user-email', data.email);
      return admin;
    } catch(e) { return false; }
  },
};


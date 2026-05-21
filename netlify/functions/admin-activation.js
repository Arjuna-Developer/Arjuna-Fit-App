const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const VALID = ['challenge_glutes','challenge_belly','custom_muscle_gain','custom_fat_loss'];
const HDR = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'POST,OPTIONS'};
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers:HDR, body:'' };
  if (event.httpMethod !== 'POST') return { statusCode:405, headers:HDR, body:JSON.stringify({error:'Method not allowed'}) };
  try {
    const { userId, product, action='activate', reason } = JSON.parse(event.body||'{}');
    const tok = (event.headers['authorization']||'').replace('Bearer ','');
    if (!tok) return { statusCode:401, headers:HDR, body:JSON.stringify({error:'No token'}) };
    if (!userId || !product || !VALID.includes(product))
      return { statusCode:400, headers:HDR, body:JSON.stringify({error:'Invalid params', valid:VALID}) };
    const { data:{ user }, error:ae } = await sb.auth.getUser(tok);
    if (ae||!user) return { statusCode:401, headers:HDR, body:JSON.stringify({error:'Invalid token'}) };
    const { data:ap } = await sb.from('profiles').select('is_admin').eq('id',user.id).single();
    if (!ap?.is_admin) return { statusCode:403, headers:HDR, body:JSON.stringify({error:'Not admin'}) };
    const upd = action==='activate'
      ? { product_type:product, subscription_status:'active', access_level:'full', onboarding_completed:true, updated_at:new Date().toISOString() }
      : { subscription_status:'inactive', access_level:'trial', updated_at:new Date().toISOString() };
    const { error:ue } = await sb.from('profiles').update(upd).eq('id',userId);
    if (ue) throw ue;
    if (action==='activate') {
      await sb.from('community_memberships').upsert({user_id:userId,community_id:'free_arjunafit_community',status:'active',joined_at:new Date().toISOString()},{onConflict:'user_id,community_id'}).catch(()=>{});
    }
    await sb.from('admin_actions').insert({admin_id:user.id,target_id:userId,action:`${action}_${product}`,reason:reason||'manual',created_at:new Date().toISOString()}).catch(()=>{});
    return { statusCode:200, headers:HDR, body:JSON.stringify({success:true,action,product,userId}) };
  } catch(e) {
    return { statusCode:500, headers:HDR, body:JSON.stringify({error:e.message}) };
  }
};
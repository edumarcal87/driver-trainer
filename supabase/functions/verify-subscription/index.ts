// supabase/functions/verify-subscription/index.ts
// 
// Deploy: supabase functions deploy verify-subscription
// Set secret: supabase secrets set MP_ACCESS_TOKEN=APP_USR-7341368707006790-032606-3c05548a31a3798ec5c5409df4c7a470-53517284
//
// This function:
// 1. Receives preapproval_id and user_id from the frontend
// 2. Calls Mercado Pago API to verify subscription status
// 3. If authorized, updates user profile to premium in Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { preapproval_id, user_id } = await req.json()

    if (!preapproval_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing preapproval_id or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Verify subscription with Mercado Pago API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${preapproval_id}`,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text()
      console.error('MP API error:', mpResponse.status, errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to verify with Mercado Pago', verified: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const subscription = await mpResponse.json()
    console.log('MP subscription status:', subscription.status, 'for user:', user_id)

    // 2. Check if subscription is active
    const isActive = subscription.status === 'authorized' || subscription.status === 'approved'

    if (!isActive) {
      return new Response(
        JSON.stringify({
          verified: false,
          status: subscription.status,
          message: `Subscription status: ${subscription.status}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Update user profile to premium in Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: 'premium',
        mp_preapproval_id: preapproval_id,
        mp_subscription_status: subscription.status,
        premium_since: new Date().toISOString(),
        mp_plan_id: subscription.preapproval_plan_id || null,
        mp_payer_email: subscription.payer_email || null,
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile', verified: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        verified: true,
        status: subscription.status,
        plan: 'premium',
        message: 'Subscription verified and profile updated',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: err.message, verified: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

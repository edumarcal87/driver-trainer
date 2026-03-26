/**
 * Mercado Pago payment integration.
 * 
 * Frontend-safe: only contains public keys and plan URLs.
 * Access Token is ONLY in the Edge Function (server-side).
 */

// Plan URLs (public — safe for frontend)
const MP_MONTHLY_URL = import.meta.env.VITE_MP_MONTHLY_URL
  || 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a25ecc65ab944c58ad8a587f1c18766e';

const MP_ANNUAL_URL = import.meta.env.VITE_MP_ANNUAL_URL
  || 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3e79abe4d0ab47e482e63e10414b4c35';

// Callback URL after payment
const CALLBACK_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/confirmacao-assinatura`
  : 'https://www.drivertrainer.com.br/confirmacao-assinatura';

/**
 * Opens Mercado Pago subscription checkout in a new tab.
 * Appends back_url so MP redirects back after payment.
 */
export function openCheckout(plan = 'monthly', userEmail = '') {
  const baseUrl = plan === 'annual' ? MP_ANNUAL_URL : MP_MONTHLY_URL;

  // Add back_url for redirect after payment
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}back_url=${encodeURIComponent(CALLBACK_URL)}`;

  window.open(url, '_blank');
}

/**
 * Plan details for UI display.
 */
export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Mensal',
    price: 19.90,
    priceFormatted: 'R$ 19,90',
    period: '/mês',
    savings: null,
    popular: false,
  },
  annual: {
    id: 'annual',
    name: 'Anual',
    price: 149.90,
    priceFormatted: 'R$ 149,90',
    period: '/ano',
    monthlyEquivalent: 'R$ 12,49/mês',
    savings: 'Economize R$ 88,90',
    popular: true,
  },
};

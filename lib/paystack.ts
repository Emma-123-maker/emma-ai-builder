// Paystack test mode FREE - https://dashboard.paystack.com/#/settings/developer
export function initPaystack(email: string, amount: number = 500000) {
  return { email, amount, reference: `emma_${Date.now()}`, callback_url: process.env.NEXT_PUBLIC_APP_URL }
}
export function verifyPayment(reference: string) { return { status: 'success', amount: 5000 } }

# TossPayments Integration Guide

This application integrates **TossPayments** v2 (결제위젯) for purchasing credit packages ("PRO Pack" and "PREMIUM Pack") to unlock higher tier portfolio generation.

## Supported Products
- **PRO_PACK**: Grants 3 Credits (₩3,000)
- **PREMIUM_PACK**: Grants 5 Credits (₩5,000)

## Architecture Flow

1. **Client Initialization (`/pricing` -> `/checkout`)**
   - User selects a pack on `/pricing` and clicks "Buy".
   - UI redirects to `/checkout?product=PRO_PACK`.
   - Client calls `POST /api/orders` to create a \`PENDING\` order in our DB, retrieving an \`orderId\` and \`amount\`.
   - Client initializes the Toss Widget using \`@tosspayments/payment-widget-sdk\`.
   - User clicks "Pay" which redirects to the Toss hosted payment page (Redirect mode).

2. **Server Confirmation (`/checkout/success` -> `/api/payments/toss/confirm`)**
   - Toss redirects user back to `/checkout/success` with \`paymentKey\`, \`orderId\`, \`amount\`.
   - Client makes a background POST to our confirmation API.
   - Server-side validates the amount against the DB.
   - Server-side calls Toss core confirm API using the secret key and a generated `Idempotency-Key`.
   - If \`DONE\`: Order is marked \`PAID\`, user granted credits, transaction committed safely.
   - If \`WAITING_FOR_DEPOSIT\`: Order is marked waiting (Virtual Account transfer).

3. **Webhook Fallback (`/api/webhooks/toss`)**
   - Toss fires a webhook when a payment state changes asynchronously (e.g. user transfers money to their virtual account).
   - Our webhook endpoint receives the payload, verifies idempotency (status check), and formally grants credits if status enters \`DONE\`.

## Environment Variables required (.env)
\`\`\`env
# Public
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"

# Secrets (DO NOT LEAK TO CLIENT)
TOSS_SECRET_KEY="test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
\`\`\`

## Testing
- Ensure the Mock Toss keys are used in development.
- Navigate to `/pricing`. Select a package.
- In the Toss Widget, use the provided "Test Cards" to simulate successful auth.
- Verify user balance increments upon redirect to `/checkout/success`.
- Virtual accounts require manual hook firing or waiting for the test sandbox to simulate a deposit.

# Payments, Entitlements, and Paywall (Step 2)

This document describes the flow for granting, deducting, and managing user "Credits" tied to the Portfolio Report Generator.

## Business Rules
- **FREE Tier (1-10 Pages):** Costs 0 credits.
- **PRO Tier (11-20 Pages):** Costs 3 credits.
- **PREMIUM Tier (21-30 Pages):** Costs 5 credits.
- Credits represent an atomic entitlement tracking value that can be safely loaded/refunded safely.

## Architecture

1. **NextAuth Session:** Frontend polls `/api/auth/session` which securely includes `$session.user.credits`.
2. **Purchasing Flow:**
   - User attempts premium feature -> Shown **Paywall (`/checkout?product=...`)**.
   - User buys via Payment Provider (`paymentProvider.createCheckout`).
   - Mock Webhook `POST /api/webhooks/payment/mock` simulates the actual provider (Toss/PortOne) responding.
   - Webhook handler validates the webhook's signature (mock bypassed logic here), marks the `Order` table `PAID`, and invokes `grantCredits`.
   - `grantCredits` is **idempotent**, keyed securely via `orderId` on the `CreditLedger` database structure.

3. **Job Creation:**
   - POST `/api/jobs` decodes payload and calls `deductCredits(userId, cost, "JOB_COST")`.
   - The deduction runs atomically via `$transaction`.
   - If User balance < Cost -> Throws 402 Insufficient Balance -> API returns gracefully.

4. **Failure Refund Strategy:**
   - Long running tasks execute in `apps/worker/src/index.ts`.
   - If catastrophic failure hits `catch (err)`, the final piece invokes `refundCredits(jobId)`.
   - `refundCredits` safely scans `CreditLedger` for that specific `jobId` and `JOB_COST` and re-adds exactly what was deducted.
   - Idempotent: Can only refund a Job once.

## To Migrate to Production (Toss/PortOne)
1. Add `TossPaymentProvider` implementing `PaymentProvider`.
2. Map Webhook logic via `crypto` or API key validation given by the vendor to assert integrity in `/api/webhooks/payment/toss/route.ts`. 

## Run Tests
Integration suite against SQLite runs correctly testing balance locks and idempotency rules:
```bash
pnpm test
```

//===========================================
// LOANIQ — NETLIFY FUNCTION
// Stripe webhook handler
// Upgrades user role in Firestore after payment
//===========================================

const stripe         = require('stripe')(process.env.STRIPE_SECRET);
const admin          = require('firebase-admin');

// ── INITIALIZE FIREBASE ADMIN ────────────────────────────────
// We only initialize once — if already initialized, reuse it.
// This is important because Netlify may reuse the same function
// instance across multiple webhook calls.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes as a string with literal \n characters
      // We replace them with real newlines so the key works correctly
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();


// ── MAIN HANDLER ────────────────────────────────────────────
exports.handler = async function (event) {

  // Only accept POST requests — Stripe always sends POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig           = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the webhook signature
    // event.body is the raw request body from Netlify
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);

  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }


  // ── HANDLE SUCCESSFUL PAYMENT ────────────────────────────
  if (stripeEvent.type === 'checkout.session.completed') {

    const session = stripeEvent.data.object;
    const uid     = session.client_reference_id;

    if (!uid) {
      console.error('No clientReferenceId — cannot upgrade user');
      return { statusCode: 200, body: 'No UID — skipped' };
    }

    try {
            // Determine which plan the user bought based on amount paid
      function getPlanName (amountTotal) {
        if (amountTotal === 5000) return 'yearly';
        if (amountTotal === 499)  return 'monthly';
        if (amountTotal === 150)  return 'weekly';
        return 'monthly'; // fallback
      }

      await db.collection('users').doc(uid).set(
        {
          role:             'admin',
          stripeCustomerId: session.customer,
          subscriptionId:   session.subscription,
          plan:             getPlanName(session.amount_total),
          upgradedAt:       new Date().toISOString()
        },
        { merge: true }
      );

      console.log(`User ${uid} upgraded to admin successfully`);

    } catch (err) {
      console.error(`Firestore update failed for ${uid}:`, err.message);
      return { statusCode: 500, body: 'Firestore update failed' };
    }
  }

  return { statusCode: 200, body: 'Received' };
};
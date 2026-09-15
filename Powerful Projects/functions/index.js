//===========================================
// LOANIQ — FIREBASE CLOUD FUNCTIONS
// Handles Stripe webhook to upgrade users
//===========================================

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const stripe    = require('stripe')(process.env.STRIPE_SECRET);;

// Initialize Firebase Admin SDK
// This gives the backend full access to Firestore (bypasses security rules)
admin.initializeApp();

const db = admin.firestore();


// ── STRIPE WEBHOOK HANDLER ───────────────────────────────────
//
// This function is triggered by Stripe every time a payment event
// happens. We listen specifically for 'checkout.session.completed'
// which fires when a user successfully pays.
//
// Stripe calls this URL automatically — you never call it yourself.

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {

  // Stripe signs every webhook with a signature header.
  // We verify it against our webhook secret to confirm
  // the request genuinely came from Stripe and not a hacker.
  const sig           = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // req.rawBody is the raw request body — required for signature verification
    // If this throws, the signature didn't match — reject the request
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    // Return 400 to tell Stripe something went wrong
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  // ── HANDLE SUCCESSFUL PAYMENT ────────────────────────────────
  if (event.type === 'checkout.session.completed') {

    const session = event.data.object;

    // clientReferenceId is the user.uid we passed from the frontend
    // This is how we know WHICH user to upgrade
    const uid = session.client_reference_id;

    if (!uid) {
      console.error('No clientReferenceId found in session — cannot upgrade user');
      // Return 200 anyway so Stripe doesn't keep retrying
      return res.status(200).send('No UID — skipped');
    }

    try {
      // Write admin role to Firestore for this user
      // merge:true so we don't overwrite their loanInputs
      await db.collection('users').doc(uid).set(
        { role: 'admin' },
        { merge: true }
      );

      console.log(`User ${uid} successfully upgraded to admin`);

    } catch (err) {
      console.error(`Failed to upgrade user ${uid}:`, err.message);
      // Return 500 — Stripe will retry the webhook later
      return res.status(500).send('Firestore update failed');
    }
  }

  // Return 200 to acknowledge receipt of the webhook
  // Always return 200 for event types we don't handle —
  // otherwise Stripe thinks delivery failed and keeps retrying
  res.status(200).send('Received');
});
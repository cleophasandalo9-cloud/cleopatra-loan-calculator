//===========================================
// LOANIQ — CREATE STRIPE CHECKOUT SESSION
//===========================================

const stripe = require('stripe')(process.env.STRIPE_SECRET);

// CORS headers — allow requests from GitHub Pages
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://cleophasandalo9-cloud.github.io',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function (event) {

  // Handle CORS preflight request
  // Browsers send an OPTIONS request first to check if CORS is allowed
  // We must respond to it before the actual POST goes through
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { uid, email, priceId } = JSON.parse(event.body);

    if (!uid || !priceId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing uid or priceId' })
      };
    }

    // Create a Stripe Checkout Session server-side
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'payment',
      customer_email: email,
      client_reference_id: uid,
      success_url: 'https://cleophasandalo9-cloud.github.io/cleopatra-loan-calculator/?payment=success',
      cancel_url:  'https://cleophasandalo9-cloud.github.io/cleopatra-loan-calculator/?payment=cancelled',
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error('Checkout session error:', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
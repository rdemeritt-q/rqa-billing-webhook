const Stripe = require("stripe");

// Client for the payments API. The key comes from the environment.
function createStripe(env = process.env) {
  return new Stripe(env.STRIPE_API_KEY, { host: "api.stripe.com" });
}

module.exports = { createStripe };

const http = require("node:http");
const { createStripe } = require("./stripe");

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Builds the request handler. `stripe` and `secret` are injected so tests need no network.
function createHandler(stripe, secret) {
  return async (req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      res.writeHead(404).end();
      return;
    }
    let event;
    try {
      const body = await readBody(req);
      event = stripe.webhooks.constructEvent(body, req.headers["stripe-signature"], secret);
    } catch (err) {
      res.writeHead(400).end("bad signature");
      return;
    }
    if (event.type === "charge.dispute.created") {
      await stripe.refunds.create({ charge: event.data.object.charge });
    }
    res.writeHead(200).end("ok");
  };
}

if (require.main === module) {
  const server = http.createServer(
    createHandler(createStripe(), process.env.STRIPE_WEBHOOK_SECRET)
  );
  server.listen(process.env.PORT || 3000);
}

module.exports = { createHandler };

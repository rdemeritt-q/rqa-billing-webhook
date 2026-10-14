const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const { createHandler } = require("../src/server");

function start(stripe) {
  const server = http.createServer(createHandler(stripe, "whsec_placeholder"));
  return new Promise((resolve) =>
    server.listen(0, () => resolve({ server, port: server.address().port }))
  );
}

function post(port, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, path, method: "POST" }, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode));
    });
    req.on("error", reject);
    req.end(body);
  });
}

test("creates a refund for a dispute event", async () => {
  const refunds = [];
  const stripe = {
    webhooks: {
      constructEvent: () => ({ type: "charge.dispute.created", data: { object: { charge: "ch_1" } } }),
    },
    refunds: { create: async (p) => refunds.push(p) },
  };
  const { server, port } = await start(stripe);
  assert.strictEqual(await post(port, "/webhook", "{}"), 200);
  assert.deepStrictEqual(refunds, [{ charge: "ch_1" }]);
  server.close();
});

test("rejects a bad signature", async () => {
  const stripe = {
    webhooks: { constructEvent: () => { throw new Error("bad"); } },
    refunds: { create: async () => assert.fail("no refund expected") },
  };
  const { server, port } = await start(stripe);
  assert.strictEqual(await post(port, "/webhook", "{}"), 400);
  server.close();
});

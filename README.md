# rqa-billing-webhook

Receives payment webhooks and creates refunds.

A small HTTP service. `POST /webhook` verifies the signature of each event. For a dispute event it creates a refund through the payments API.

## Configuration

Copy `.env.template` to `.env` and set:

- `STRIPE_API_KEY`: API key for outbound calls
- `STRIPE_WEBHOOK_SECRET`: signing secret for incoming events
- `PORT`: optional, default 3000

## Run

    npm ci
    node src/server.js

## Test

    npm test

The tests inject a fake client and make no network calls.

## Docker

    docker build -t rqa-billing-webhook .
    docker run --rm -p 3000:3000 --env-file .env rqa-billing-webhook

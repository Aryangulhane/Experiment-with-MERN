// server/routes/yourWebhookRoute.js or wherever your webhook logic is
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const sanityWebhookSecret = process.env.SANITY_WEBHOOK_SECRET;

router.post('/webhook/sync', express.json({ type: 'application/json' }), async (req, res) => {
  // 1. Verify the signature
  const signature = req.headers['sanity-signature'];
  if (!signature) {
    return res.status(401).send('No signature header found');
  }

  const hmac = crypto.createHmac('sha256', sanityWebhookSecret);
  hmac.update(JSON.stringify(req.body));
  const digest = hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).send('Invalid signature');
  }

  // 2. If signature is valid, process the webhook payload
  const { _id, _type, operation } = req.body;
  console.log(`Received webhook for ${_type} (ID: ${_id}, Operation: ${operation})`);

  // Here you would add logic to:
  // - Invalidate a cache
  // - Rebuild static pages (if using ISR/SSG)
  // - Trigger a data refresh for your frontend
  // For a simple MERN app, this might just log the event.

  res.status(200).send('Webhook received and processed.');
});

module.exports = router;
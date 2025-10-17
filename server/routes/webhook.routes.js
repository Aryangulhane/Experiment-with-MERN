// server/routes/webhook.routes.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// --- Get secrets from environment variables ---
const sanityWebhookSecret = process.env.SANITY_WEBHOOK_SECRET;
const frontendUrl = process.env.NEXT_PUBLIC_VERCEL_FRONTEND_URL; // e.g., https://your-frontend.vercel.app
const revalidateSecret = process.env.NEXT_REVALIDATE_SECRET; // A secret token you create for the revalidation endpoint

router.post('/webhook/sync', express.json(), async (req, res) => {
  // --- 1. Enhanced Security Checks ---
  if (!sanityWebhookSecret) {
    console.error('🔴 Sanity webhook secret is not configured on the server.');
    return res.status(500).send('Webhook secret not configured.');
  }

  const signature = req.headers['sanity-signature'];
  if (!signature) {
    console.warn('⚠️ No signature header found on incoming webhook request.');
    return res.status(401).send('Unauthorized: No signature header found.');
  }

  // --- 2. Robust Signature Verification ---
  try {
    const hmac = crypto.createHmac('sha256', sanityWebhookSecret);
    hmac.update(JSON.stringify(req.body));
    const digest = hmac.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      console.warn('🚨 Invalid signature on incoming webhook request.');
      return res.status(401).send('Unauthorized: Invalid signature.');
    }
  } catch (error) {
    console.error('❌ Error during webhook signature verification:', error);
    return res.status(500).send('Internal Server Error during signature verification.');
  }

  // --- 3. Process the Validated Payload ---
  try {
    const { _id, _type, operation } = req.body;
    console.log(`✅ Webhook received and validated for type: ${_type}, ID: ${_id}, Operation: ${operation}`);

    // --- 4. Trigger Frontend Revalidation (The key to seeing updates live) ---
    if (frontendUrl && revalidateSecret) {
      // Define the paths on your frontend you want to update.
      // For a project change, you want to update the main projects page.
      const pathToRevalidate = '/projects'; 

      console.log(`🚀 Triggering revalidation for path: ${pathToRevalidate}`);

      // Send a POST request to your Next.js app's revalidation API route.
      const revalidateResponse = await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: revalidateSecret,
          path: pathToRevalidate,
        }),
      });

      if (!revalidateResponse.ok) {
        const errorText = await revalidateResponse.text();
        console.error(`❌ Frontend revalidation failed with status ${revalidateResponse.status}:`, errorText);
      } else {
        const responseJson = await revalidateResponse.json();
        console.log('✅ Frontend revalidation successful:', responseJson);
      }
    } else {
      console.warn('⚠️ Frontend URL or revalidation secret not set. Skipping revalidation step.');
    }

    res.status(200).json({ message: 'Webhook processed and revalidation triggered.' });

  } catch (error) {
    console.error('❌ Error processing webhook payload or triggering revalidation:', error);
    res.status(500).json({ message: 'Failed to process webhook.' });
  }
});

module.exports = router;
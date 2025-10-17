// server/routes/webhook.routes.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
// Import the Project Model to use for database operations
const ProjectModel = require('../models/projects.model'); 

// --- Get secrets from environment variables ---
const sanityWebhookSecret = process.env.SANITY_WEBHOOK_SECRET;
const frontendUrl = process.env.NEXT_PUBLIC_VERCEL_FRONTEND_URL; 
const revalidateSecret = process.env.NEXT_REVALIDATE_SECRET; 

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

    // --- 3. Process the Validated Payload & Sync DB ---
    try {
        const { _id, _type, operation } = req.body;
        console.log(`✅ Webhook received and validated for type: ${_type}, ID: ${_id}, Operation: ${operation}`);

        if (_type === 'project' && (operation === 'create' || operation === 'update')) {
            console.log(`Attempting to sync Sanity Project ${_id} to MongoDB...`);

            // Map fields from the Sanity payload (which uses keys like 'projectName', 'tags', etc.)
            const projectPayload = {
                // Use Sanity's unique ID as the foreign key in MongoDB
                sanityId: _id, 
                
                // Map the rest of the fields directly. 
                // NOTE: 'projectName' may be 'title' if your Sanity schema uses 'title' instead of 'projectName'
                projectName: req.body.projectName, 
                description: req.body.description,
                liveUrl: req.body.liveUrl,
                githubUrl: req.body.githubUrl,
                imageUrl: req.body.imageUrl, 
                tags: req.body.tags || [],
                // Pass an empty array since the required validation was removed
                categories: [], 
            };
            
            // Upsert Logic: Find by the unique sanityId. Insert if not found (upsert: true).
            const savedProject = await ProjectModel.findOneAndUpdate(
                { sanityId: _id },      // 1. Find the project by its Sanity ID
                projectPayload,         // 2. Data to update/insert
                { 
                    upsert: true, 
                    new: true, 
                    runValidators: true // Ensure required fields (like projectName and sanityId) are present
                }
            );

            console.log(`✅ MongoDB synced: Project ${savedProject.projectName} (Mongo ID: ${savedProject._id}, Operation: ${operation}).`);
        }

        // --- 4. Trigger Frontend Revalidation (The key to seeing updates live) ---
        if (frontendUrl && revalidateSecret) {
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

        res.status(200).json({ message: 'Webhook processed, MongoDB synced, and revalidation triggered.' });

    } catch (error) {
        console.error('❌ Error processing webhook payload or syncing DB:', error);
        // It's crucial to return a 500 status on failure so Sanity attempts to retry the webhook
        res.status(500).json({ message: 'Failed to process webhook.', details: error.message }); 
    }
});

module.exports = router;
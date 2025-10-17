const express = require('express');
const crypto = require('crypto');
const router = express.Router();
// --- 1. Import Mongoose Model for Sync ---
const ProjectModel = require('../models/projects.model');

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

        // ----------------------------------------------------
        //        START: MONGODB SYNCHRONIZATION LOGIC
        // ----------------------------------------------------

        if (_type === 'project' && (operation === 'create' || operation === 'update')) {
            console.log(`Attempting to sync Sanity Project ${_id} to MongoDB...`);

            // MAPPING ASSUMPTIONS: 
            // - The Sanity 'title' is mapped to Mongo 'projectName'.
            // - Sanity fields like 'liveUrl' and 'githubUrl' exist and match Mongo model names.
            // - Sanity's image field ('mainImage' object) is difficult to map directly to a string 'imageUrl'.
            //   You must use the Sanity Image URL builder on the backend or adjust your model.
            //   For now, we map a simple string, which you'll need to update.
            
            const projectPayload = {
                // Best Practice: Use the Sanity _id as a unique foreign key in MongoDB
                sanityId: _id, 
                
                // Map fields from Sanity payload (assuming Sanity sends the full document body)
                projectName: req.body.title || req.body.projectName, // Sanity often uses 'title'
                description: req.body.description,
                liveUrl: req.body.liveUrl,
                githubUrl: req.body.githubUrl,
                
                // --- CATEGORIES & TAGS WARNING ---
                // If the MongoDB model requires categories (ObjectIDs), you MUST resolve the 
                // Sanity category references here. For now, passing an empty array or an array of tags (strings).
                tags: req.body.tags || [], 
                categories: [], // Assuming you made categories optional in the Mongoose model (as discussed)
                
                // TEMPORARY IMAGE URL MAPPING: This needs to be resolved using Sanity Image URL Builder
                imageUrl: req.body.imageUrl || 'image-url-resolution-needed',
            };

            // Use findOneAndUpdate for UPSERT (Update OR Insert)
            const savedProject = await ProjectModel.findOneAndUpdate(
                // Find criteria: Use the Sanity ID to reliably find the document.
                // NOTE: Your Mongoose Project model needs a 'sanityId' field for this to work robustly.
                { sanityId: _id }, 
                
                // Update/Insert Data
                projectPayload,
                
                // Options: upsert: true means insert if no document is found. new: true returns the updated document.
                { upsert: true, new: true, runValidators: true }
            );

            console.log(`✅ MongoDB synced: Project ${savedProject.projectName} (Mongo ID: ${savedProject._id}, Operation: ${operation}).`);
        }

        // ----------------------------------------------------
        //         END: MONGODB SYNCHRONIZATION LOGIC
        // ----------------------------------------------------


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

        res.status(200).json({ message: 'Webhook processed, MongoDB synced, and revalidation triggered.' });

    } catch (error) {
        console.error('❌ Error processing webhook payload or triggering revalidation:', error);
        res.status(500).json({ message: 'Failed to process webhook.' });
    }
});

module.exports = router;
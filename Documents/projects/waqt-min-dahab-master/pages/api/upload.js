import { createClient } from '@supabase/supabase-js';
import { verifyAuth, verifyLegacyAuth, isAdmin } from '../../lib/auth';

export const config = {
    api: {
        bodyParser: false,
    },
};

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || 'ezz';

export default async function handler(req, res) {
    // Authentication
    let user = await verifyAuth(req);
    if (!user) {
        user = verifyLegacyAuth(req);
    }

    if (!user || !isAdmin(user)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const { filename } = req.query;
            const contentType = req.headers['content-type'] || 'application/octet-stream';

            if (!filename) {
                return res.status(400).json({ error: 'Missing filename in query' });
            }

            // Read body into Buffer
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            if (buffer.length === 0) {
                return res.status(400).json({ error: 'Empty file' });
            }

            // Sanitize filename
            const timestamp = Date.now();
            const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const finalName = `products/${timestamp}-${safeName}`;

            console.log(`Uploading ${finalName} (${buffer.length} bytes) to Supabase bucket: ${BUCKET}`);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(BUCKET)
                .upload(finalName, buffer, {
                    contentType: contentType,
                    upsert: false,
                });

            if (error) {
                console.error('Supabase upload error:', error);
                return res.status(500).json({ error: error.message });
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(finalName);

            return res.status(200).json({ success: true, url: urlData.publicUrl });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: error.message });
        }

    } else if (req.method === 'DELETE') {
        try {
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const { url } = body;

            if (url) {
                // Extract file path from Supabase public URL
                // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
                const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
                if (match) {
                    const filePath = match[1];
                    await supabase.storage.from(BUCKET).remove([filePath]);
                }
            }

            return res.status(200).json({ success: true, message: 'File deleted' });
        } catch (error) {
            return res.status(200).json({ success: true, message: 'Deletion attempted' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

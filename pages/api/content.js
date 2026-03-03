import { sql } from '../../lib/db';
import { verifyAuth, isAdmin } from '../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const rows = await sql`SELECT key, value FROM content`;
            const content = {};
            rows.forEach(row => content[row.key] = row.value);
            return res.status(200).json(content);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'PUT') {
        let user = await verifyAuth(req);
        if (!user) {
            user = verifyLegacyAuth(req);
        }

        if (!user || !isAdmin(user)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const updates = req.body;
        try {
            // Neon using pg allows upsert
            // Batch process updates
            for (const [k, v] of Object.entries(updates)) {
                await sql`
                    INSERT INTO content (key, value)
                    VALUES (${k}, ${v})
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                `;
            }
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

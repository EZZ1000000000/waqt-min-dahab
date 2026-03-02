import { sql } from '../../../lib/db';
import { verifyAuth, isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const rows = await sql`SELECT * FROM products WHERE is_active = 1 ORDER BY order_index ASC, id DESC`;
            return res.status(200).json(rows);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        let user = await verifyAuth(req);
        if (!user) {
            user = verifyLegacyAuth(req);
        }

        if (!user || !isAdmin(user)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, price, image_url, badge } = req.body;
        if (!name || !price || !image_url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const result = await sql`
                INSERT INTO products (name, price, image_url, badge)
                VALUES (${name}, ${price}, ${image_url}, ${badge || ''})
                RETURNING id
            `;
            return res.status(200).json({ success: true, id: result[0].id });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

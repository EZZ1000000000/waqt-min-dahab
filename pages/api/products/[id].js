import { sql } from '../../../lib/db';
import { verifyAuth, verifyLegacyAuth, isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
    let user = await verifyAuth(req);
    if (!user) {
        user = verifyLegacyAuth(req);
    }

    if (!user || !isAdmin(user)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'PUT') {
        const { name, price, image_url, badge, is_active } = req.body;
        try {
            await sql`
                UPDATE products
                SET name = COALESCE(${name}, name),
                    price = COALESCE(${price}, price),
                    image_url = COALESCE(${image_url}, image_url),
                    badge = COALESCE(${badge}, badge),
                    is_active = COALESCE(${is_active}, is_active)
                WHERE id = ${id}
            `;
            return res.status(200).json({ success: true, changes: 1 });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            await sql`DELETE FROM products WHERE id = ${id}`;
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

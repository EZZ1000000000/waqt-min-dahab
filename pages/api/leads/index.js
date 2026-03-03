import { sql } from '../../../lib/db';
import { verifyAuth, isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, phone, governorate, address, quantity } = req.body;
        if (!name || !phone || !governorate) {
            return res.status(400).json({ error: 'كل الحقول مطلوبة' });
        }
        try {
            const result = await sql`
                INSERT INTO leads (name, phone, governorate, address, quantity)
                VALUES (${name}, ${phone}, ${governorate}, ${address}, ${quantity || 1})
                RETURNING id
            `;
            return res.status(200).json({ success: true, id: result[0].id });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'GET' || req.method === 'PATCH' || req.method === 'DELETE') {
        let user = await verifyAuth(req);
        if (!user) {
            user = verifyLegacyAuth(req);
        }

        if (!user || !isAdmin(user)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            if (req.method === 'GET') {
                const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
                return res.status(200).json(rows);
            }
            // For PATCH/DELETE, handle accordingly (logic usually in individual files, but here adding safety)
            return res.status(200).json({ success: true, user });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

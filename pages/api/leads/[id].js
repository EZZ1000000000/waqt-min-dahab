import { sql } from '../../../lib/db';
import { verifyAuth, isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
    let user = await verifyAuth(req);
    if (!user) {
        user = verifyLegacyAuth(req);
    }

    if (!user || !isAdmin(user)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'PATCH') {
        const { status, notes } = req.body;
        try {
            await sql`
                UPDATE leads
                SET status = COALESCE(${status}, status),
                    notes = COALESCE(${notes}, notes)
                WHERE id = ${id}
            `;
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            await sql`DELETE FROM leads WHERE id = ${id}`;
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

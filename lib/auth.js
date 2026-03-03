import { jwtVerify, createRemoteJWKSet } from 'jose';

let JWKS = null;

function getJWKS() {
    if (!JWKS && process.env.NEON_JWKS_URL) {
        try {
            JWKS = createRemoteJWKSet(new URL(process.env.NEON_JWKS_URL));
        } catch (err) {
            console.error('Failed to initialize JWKS:', err.message);
        }
    }
    return JWKS;
}

export async function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    const jwks = getJWKS();
    if (!jwks) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, jwks, {
            issuer: process.env.NEON_AUTH_URL,
        });

        return payload;
    } catch (err) {
        console.error('Auth verification failed:', err.message);
        return null;
    }
}

export function isAdmin(user) {
    if (!user) return false;
    // Check for Neon Auth admin email or legacy admin role
    return user.email === process.env.AUTH_ADMIN_EMAIL || user.role === 'legacy_admin';
}

export function verifyLegacyAuth(req) {
    const user = req.headers['x-admin-user'];
    const pass = req.headers['x-admin-pass'];

    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        return { email: 'admin@legacy.com', role: 'legacy_admin' };
    }
    return null;
}

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import Cors from 'cors';
import { OAuth2Client } from 'google-auth-library';


// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '989472724021-51r6abpc2bv48i5v0hi1d3bgnqnp9rpf.apps.googleusercontent.com'; // Ensure this is set
const MONGODB_URI = process.env.CONNECTION_STRING || '';
const DB_NAME = process.env.DB_NAME || 'authorizations';

// Initialize CORS middleware
const cors = Cors({
    methods: ['GET'], // Allow only GET requests
    origin: /^http:\/\/localhost(:[0-9]+)?$/, // Allow any localhost origin with optional port
});

// Google OAuth2 Client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token: string) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload(); // Returns user info
}

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const sessionToken = req.headers.authorization?.split(' ')[1];

        if (!sessionToken) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify Google token
        let decoded;
        try {
            decoded = await verifyGoogleToken(sessionToken);
        } catch (error) {
            console.error('Error verifying Google token:', error);
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        // Connect to MongoDB
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('users');

        // Find user by Google ID
        const user = await collection.findOne({ googleId: decoded.sub });

        await client.close();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                googleId: user.googleId,
            },
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

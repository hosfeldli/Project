import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb'; // Only imported here, server-side.
import Cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const MONGODB_URI = process.env.CONNECTION_STRING || '';
const DB_NAME = process.env.DB_NAME || 'authorizations';

// Initialize CORS middleware
const cors = Cors({
    methods: ['POST'], // Allow only POST requests
    origin: /^http:\/\/localhost(:[0-9]+)?$/, // Allow any localhost origin with optional port
});

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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Missing token' });
        }

        // Decode the Google JWT token
        const decoded = jwt.decode(token);
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const { sub, name, email, picture } = decoded as { sub: string; name: string; email: string; picture: string };

        // Connect to MongoDB
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('users');

        // Check if user exists
        let user = await collection.findOne({ googleId: sub });
        if (!user) {
            user = {
                googleId: sub,
                name,
                email,
                picture,
                token,
            };
            await collection.insertOne(user);
        }

        // Generate a session token for the user
        const sessionToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        await client.close();

        return res.status(200).json({ message: 'Authenticated', sessionToken, user });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
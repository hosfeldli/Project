import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import Cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'authorizations';

// Initialize CORS middleware
const cors = Cors({
    methods: ['GET'], // Allow only GET requests
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

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const sessionToken = req.headers.authorization?.split(' ')[1];

        if (!sessionToken) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify the session token
        const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
        
        // Connect to MongoDB
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('users');

        // Find the user by ID
        const user = await collection.findOne({ _id: new ObjectId(decoded.userId) });
        
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
                googleId: user.googleId
            }
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import Cors from 'cors';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '989472724021-51r6abpc2bv48i5v0hi1d3bgnqnp9rpf.apps.googleusercontent.com';
const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'authorizations';

// Initialize CORS middleware for both GET and POST
const cors = Cors({
  methods: ['GET', 'POST'],
  origin: /^http:\/\/localhost(:[0-9]+)?$/, // Allow localhost with any port
});

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token: string) {
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
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
  await runMiddleware(req, res, cors);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection('users');

  try {
    if (req.method === 'POST') {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Missing token' });
      }

      const decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(400).json({ message: 'Invalid token' });
      }

      const { sub, name, email, picture } = decoded as {
        sub: string;
        name: string;
        email: string;
        picture: string;
      };

      let user = await collection.findOne({ googleId: sub });
      if (!user) {
        user = { _id: new ObjectId(), googleId: sub, name, email, picture, token };
        await collection.insertOne(user);
      }

      const sessionToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({ message: 'Authenticated', sessionToken, user });
    }

    if (req.method === 'GET') {
      const sessionToken = req.headers.authorization?.split(' ')[1];
      if (!sessionToken) {
        return res.status(401).json({ message: 'No token provided' });
      }

      let decoded;
      try {
        decoded = await verifyGoogleToken(sessionToken);
      } catch (error) {
        console.error('Error verifying Google token:', error);
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      if (!decoded || !decoded.sub) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const user = await collection.findOne({ googleId: decoded.sub });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          googleId: user.googleId,
        },
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}

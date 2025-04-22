import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import Cors from 'cors';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'authorizations';

const cors = Cors({
  methods: ['POST', 'GET'],
  origin: /^http:\/\/localhost(:[0-9]+)?$/,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection('users');

  try {
    if (req.method === 'POST') {
      const { username, password, mode } = req.body;

      if (!username || !password || !mode)
        return res.status(400).json({ message: 'Missing username, password, or mode' });

      const existingUser = await users.findOne({ username });

      if (mode === 'register') {
        if (existingUser) return res.status(409).json({ message: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = new ObjectId();
        const newUser = {
          _id: id,
          id: id,
          username,
          password: hashedPassword,
          createdAt: new Date(),
        };
        await users.insertOne(newUser);

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ message: 'User created', userToken: id, sessionToken: token });
      }

      // login
      if (!existingUser) return res.status(401).json({ message: 'Invalid credentials' });

      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ message: 'Logged in', userToken: existingUser._id, sessionToken: token });
    }

    if (req.method === 'GET') {
      // Extract user ID from query parameters
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'User ID is required and must be a string' });
      }

      // Validate if id is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await users.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } } // Do not return password
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'authorizations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { googleId } = req.method === 'GET' || req.method === 'DELETE' ? req.query : req.body;

  if (!googleId || typeof googleId !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid googleId' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    if (req.method === 'POST') {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ message: 'Missing data' });
      }

      const result = await users.updateOne(
        { googleId },
        {
          $push: {
            "serviceKeys": {
              $each: [{
                data,
                uploadedAt: new Date(),
              }]
            }
          }
        },
        { upsert: true }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'File uploaded successfully' });

    } else if (req.method === 'GET') {
      const user = await users.findOne({ googleId }, { projection: { serviceKeys: 1, _id: 0 } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user.serviceKeys || []);

    } else if (req.method === 'DELETE') {
      const { index } = req.query;
      const idx = parseInt(index as string);

      if (isNaN(idx)) {
        return res.status(400).json({ message: 'Missing or invalid index' });
      }

      const user = await users.findOne({ googleId }, { projection: { serviceKeys: 1 } });

      if (!user || !Array.isArray(user.serviceKeys) || idx < 0 || idx >= user.serviceKeys.length) {
        return res.status(404).json({ message: 'Service key not found at index' });
      }

      user.serviceKeys.splice(idx, 1);

      await users.updateOne({ googleId }, { $set: { serviceKeys: user.serviceKeys } });

      return res.status(200).json({ message: 'Service key deleted successfully' });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    await client.close();
  }
}

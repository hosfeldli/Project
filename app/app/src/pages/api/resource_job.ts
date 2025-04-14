import { MongoClient } from 'mongodb';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const DB_NAME = process.env.DB_NAME || 'authorizations';

const fetchAndStoreResources = async (googleId: string, serviceKeys: ServiceKey[]) => {
  const results: Record<number, any> = {};

  for (let i = 0; i < serviceKeys.length; i++) {
    const keyEntry = serviceKeys[i];
    const rawKeyData = keyEntry?.data;
    if (!rawKeyData) continue;

    try {
      const parsedKey = rawKeyData;
      const projectId = parsedKey.project_id;

      const auth = new GoogleAuth({
        credentials: parsedKey,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      const asset = google.cloudasset({ version: 'v1', auth });

      const assets = await asset.assets.list({
        parent: `projects/${projectId}`,
        contentType: 'RESOURCE',
        readTime: new Date().toISOString(),
      });

      results[i] = assets.data.assets || [];
    } catch (error) {
      console.error(`Error fetching resources for key ${i} (user ${googleId}):`, error);
    }
  }

  return results;
};

// Types
interface ServiceKey {
  data?: {
    [key: string]: any;
    project_id: string;
  };
}

interface User {
  googleId: string;
  serviceKeys: ServiceKey[];
  resources?: Record<number, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection<User>('users');

    if (req.method === 'PUT') {
      const { googleId } = req.body;

      if (!googleId) {
        return res.status(400).json({ message: 'Missing googleId in request body' });
      }

      const user = await users.findOne({ googleId });

      if (!user || !Array.isArray(user.serviceKeys)) {
        return res.status(404).json({ message: 'User not found or missing service keys' });
      }

      const resources = await fetchAndStoreResources(googleId, user.serviceKeys);
      await users.updateOne({ googleId }, { $set: { resources } });

      console.log(`✅ Updated resources for ${googleId}`);
      return res.status(200).json({ message: 'Resources updated successfully' });
    }

    if (req.method === 'GET') {
      const googleId = req.query.googleId as string;

      if (!googleId) {
        return res.status(400).json({ message: 'Missing googleId in query parameters' });
      }

      const user = await users.findOne({ googleId });

      if (!user || !user.resources) {
        return res.status(404).json({ message: 'User or resources not found' });
      }

      return res.status(200).json({ resources: user.resources });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('❌ Error handling request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

// Define the service key type
interface ServiceKey {
  data: any;
  uploadedAt: Date;
  label?: string; // added label for renaming support
}
 
// Define the user document type
interface User {
  _id: ObjectId;
  id: string;
  serviceKeys: ServiceKey[];
  resources?: Record<number, any>;
}

const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const DB_NAME = process.env.DB_NAME || 'authorizations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isGetOrDelete = req.method === 'GET' || req.method === 'DELETE';
  const { id } = isGetOrDelete ? req.query : req.body;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Missing or invalid id' });
  }

  const objectId = new ObjectId(id);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection<User>('users'); // 👈 Typed collection here

    if (req.method === 'POST') {
      // Add new serviceKey
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ message: 'Missing data' });
      }

      const result = await users.updateOne(
        { _id: objectId },
        {
          $push: {
            serviceKeys: {
              data,
              uploadedAt: new Date(),
              label: data.label || '', // init label if available in data, else empty
            } as ServiceKey,
          },
        },
        { upsert: true }
      );

      return res.status(200).json({ message: 'File uploaded successfully' });

    } else if (req.method === 'GET') {
      // Fetch serviceKeys
      const user = await users.findOne({ _id: objectId }, { projection: { serviceKeys: 1 } });

      if (!user || !Array.isArray(user.serviceKeys)) {
        return res.status(200).json([]);
      }

      return res.status(200).json(user.serviceKeys);

    } else if (req.method === 'DELETE') {
      // Delete serviceKey by index
      const { index } = req.query;
      const idx = parseInt(index as string);

      if (isNaN(idx)) {
        return res.status(400).json({ message: 'Missing or invalid index' });
      }

      const user = await users.findOne({ _id: objectId }, { projection: { serviceKeys: 1 } });

      if (!user || !Array.isArray(user.serviceKeys) || idx < 0 || idx >= user.serviceKeys.length) {
        return res.status(404).json({ message: 'Service key not found at index' });
      }

      user.serviceKeys.splice(idx, 1);
      await users.updateOne({ _id: objectId }, { $set: { serviceKeys: user.serviceKeys } });

      return res.status(200).json({ message: 'Service key deleted successfully' });

    } else if (req.method === 'PATCH') {
      // Rename serviceKey label by index
      const { index, label } = req.body;

      if (typeof index !== 'number' || index < 0) {
        return res.status(400).json({ message: 'Missing or invalid index' });
      }

      if (typeof label !== 'string' || label.trim() === '') {
        return res.status(400).json({ message: 'Missing or invalid label' });
      }

      const user = await users.findOne({ _id: objectId }, { projection: { serviceKeys: 1 } });
      if (!user || !Array.isArray(user.serviceKeys) || index >= user.serviceKeys.length) {
        return res.status(404).json({ message: 'Service key not found at index' });
      }

      // Update label for the specified index
      user.serviceKeys[index].label = label.trim();

      await users.updateOne({ _id: objectId }, { $set: { serviceKeys: user.serviceKeys } });

      return res.status(200).json({ message: 'Service key label updated successfully' });

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
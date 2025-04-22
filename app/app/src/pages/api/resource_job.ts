import { MongoClient, ObjectId } from 'mongodb';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const MONGODB_URI = 'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true';
const DB_NAME = 'authorizations';

const fetchAndStoreResources = async (id: string, serviceKeys: ServiceKey[]) => {
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

            // Filter for only VMs and Disks
            const filteredAssets = (assets.data.assets || []).filter((asset) =>
                asset.assetType === 'compute.googleapis.com/Instance' ||
                asset.assetType === 'compute.googleapis.com/Disk'
            );

            results[i] = filteredAssets;
        } catch (error) {
            console.error(`Error fetching resources for key ${i} (user ${id}):`, error);
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
    _id: ObjectId;
    id: string;
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
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'Missing id in request body' });
            }

            const objectId = new ObjectId(id); // Convert id to ObjectId
            const user = await users.findOne({ _id: objectId });

            if (!user || !Array.isArray(user.serviceKeys)) {
                return res.status(404).json({ message: 'User not found or missing service keys' });
            }

            const resources = await fetchAndStoreResources(id, user.serviceKeys);
            await users.updateOne({ _id: objectId }, { $set: { resources } });

            console.log(`✅ Updated resources for ${id}`);
            return res.status(200).json({ message: 'Resources updated successfully' });
        }

        if (req.method === 'GET') {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ message: 'Missing or invalid id in query parameters' });
            }

            const objectId = new ObjectId(id); // Convert id to ObjectId
            const user = await users.findOne({ _id: objectId });

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

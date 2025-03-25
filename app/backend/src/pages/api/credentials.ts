import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

// Secret key for decryption (in a real app, this should be in environment variables)
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default';
const ALGORITHM = 'aes-256-cbc';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'authorizations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { encryptedData, iv } = req.query; // Extracting from query parameters

        if (!encryptedData || !iv) {
            return res.status(400).json({ message: 'Missing encrypted data or IV' });
        }

        // Decrypt the data
        const decrypted = decrypt(encryptedData as string, iv as string);
        
        // Store in MongoDB
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('decryptedData');
        
        // Insert the decrypted data
        const result = await collection.insertOne({
            decryptedData: decrypted,
            timestamp: new Date()
        });
        
        await client.close();
        
        return res.status(200).json({ 
            decrypted,
            stored: true,
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error processing data' });
    }
}

// Decryption function
function decrypt(encryptedText: string, ivString: string): string {
    const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
    const iv = Buffer.from(ivString, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    const encryptedBuffer = Buffer.from(encryptedText, 'hex');
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
}
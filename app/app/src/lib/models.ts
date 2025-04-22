import { MongoClient, ObjectId, Db, Collection } from 'mongodb';

const MONGODB_URI =
  process.env.CONNECTION_STRING ||
  'mongodb+srv://liamhosfeld:WHfo3zECWP8DKECo@cluster0.dt4wqx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'authorizations';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (!client || !client.isConnected?.()) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return { db, client };
}

export interface User {
  _id: ObjectId;
  username: string;
  password: string;
  createdAt: Date;
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const { db } = await connectToDatabase();
  return db.collection<User>('users');
}

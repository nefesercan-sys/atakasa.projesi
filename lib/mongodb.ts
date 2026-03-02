import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Lütfen .env.local dosyasına MONGODB_URI ekleyin');
}

if (process.env.NODE_ENV === 'development') {
  // Geliştirme modunda bağlantının kopmaması için global değişken kullanılır
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Canlı (Production) modunda normal bağlantı kullanılır
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

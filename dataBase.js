
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

export const connect = async () => {
    if (mongoose.connection.readyState === 1) return;

    mongoServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 }
    });
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    await mongoose.connection.syncIndexes()
    console.log('Connesso al database in memoria per i test!');
};

export const disconnect = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};
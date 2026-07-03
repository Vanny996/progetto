/*import mongoose from 'mongoose';
import { MongoMemoryServer } from "mongodb-memory-server";

const connectionString = 'mongodb://localhost:27014/progettoFinale';
let mongoServer = null;
let connectionPromise = null;

export const connect = async () => {
    if (mongoose.connection.readyState === 1) return;

    if (connectionPromise) {
        await connectionPromise;
        return;
    }

    console.log("Mongo connection string " + connectionString);

    try {
        if (process.env.NODE_ENV === 'test') {
            connectionPromise = (async () => {
                mongoServer = await MongoMemoryServer.create({
                    instance: { launchTimeout: 60000 }
                });
                await mongoose.connect(mongoServer.getUri());
                console.log('Connected to memory server');
            })();
            await connectionPromise;
        } else {
            await mongoose.connect(connectionString);
            console.log('connected to mongodb');
        }
    } catch (err) {
        connectionPromise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};*/

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
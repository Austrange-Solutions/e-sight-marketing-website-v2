import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// TypeScript declaration for global mongoose cache
declare global {
    var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined in environment variables');
}

// Enhanced connection options for production
const options = {
    bufferCommands: false,
    maxPoolSize: 5, // Further reduce pool size to avoid connection overload
    serverSelectionTimeoutMS: 6000, // Faster server selection timeout
    socketTimeoutMS: 20000, // Faster socket timeout for quicker failure detection
    connectTimeoutMS: 8000, // Faster connection timeout
    family: 4, // Use IPv4, skip trying IPv6
    maxIdleTimeMS: 15000, // Faster idle timeout
    minPoolSize: 1, // Minimal connections to start
    retryWrites: true,
    retryReads: false, // Disable retry reads to fail faster
    heartbeatFrequencyMS: 5000, // More frequent health checks
    maxStalenessSeconds: 60, // Reduce stale read tolerance
    compressors: ['zlib' as const], // Enable compression to reduce network load
    zlibCompressionLevel: 6 as const, // Moderate compression level
};

// Global cached connection
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connect() {
    try {
        // Return existing connection if available
        if (cached.conn) {
            return cached.conn;
        }

        // If no cached promise, create new connection
        if (!cached.promise) {
            cached.promise = mongoose.connect(MONGODB_URI, options);
        }

        try {
            cached.conn = await cached.promise;
            console.log("MongoDB connected successfully");
        } catch (e) {
            cached.promise = null;
            throw e;
        }

        const connection = mongoose.connection;

        connection.on('error', (err) => {
            console.log("MongoDB connection error: " + err);
            // Don't exit process in production, just log error
            if (process.env.NODE_ENV !== 'production') {
                process.exit();
            }
        });

        connection.on('disconnected', () => {
            console.log("MongoDB disconnected. Attempting to reconnect...");
            cached.conn = null;
            cached.promise = null;
        });

        // Increase the max listeners to prevent warnings
        connection.setMaxListeners(20);

        return cached.conn;

    } catch (error) {
        console.log("Something went wrong in connecting to DB");
        console.log(error);
        cached.promise = null;
        throw error;
    }
}
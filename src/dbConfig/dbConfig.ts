import mongoose from "mongoose";

export async function connect() {
    try {
        // Check if already connected
        if (mongoose.connections[0].readyState) {
            return;
        }

        mongoose.connect(process.env.MONGODB_URI!)
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("MongoDB connected successfully");
        })
        
        connection.on('error', (err) => {
            console.log("MongoDB connection error. Please make sure DB is running. " + err);
            process.exit();
        })

        // Increase the max listeners to prevent warnings
        connection.setMaxListeners(15);

    } catch (error) {
        console.log("Something went wrong in connecting to DB");
        console.log(error);
    }
}
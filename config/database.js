import mongoose from 'mongoose';

const connectDatabase = async () => {
    try {
        console.log('Connecting to MongoDB with URL:', process.env.mongodb_url);
        await mongoose.connect(process.env.mongodb_url);
        console.log('Database connection established');
    } catch (error) {
        console.log('Error connecting to the database:', error.message);
    }
};

export default connectDatabase;

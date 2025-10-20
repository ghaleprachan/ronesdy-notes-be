import mongoose from 'mongoose';
import config from '../config';

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URL, {
      dbName: config.DB_NAME,
    });
    console.log(`MongoDb Connected ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error ` + error);
    throw error;
  }
};

export default connectDb;

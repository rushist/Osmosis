import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const deleted1 = await mongoose.connection.collection('registrations').deleteMany({});
    const deleted2 = await mongoose.connection.collection('events').deleteMany({});
    
    console.log('Deleted registrations:', deleted1.deletedCount);
    console.log('Deleted events:', deleted2.deletedCount);
    console.log('Database cleared successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearDatabase();

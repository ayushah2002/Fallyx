import app from './app';
import connectDB from './database/connect/connectDB';
import dotenv from 'dotenv';

dotenv.config();

connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server running on port 3000', process.env.DB_NAME);
    })
    })
    .catch((error) => {
        console.error('Failed to start server', error);
        process.exit(1);
    })
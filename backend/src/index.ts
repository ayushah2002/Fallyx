import app from './app';
import connectDB from './database/connect/connectDB';
import dotenv from 'dotenv';

dotenv.config();

connectDB().then(() => {
    app.listen(4000, () => {
        console.log('Server running on port 4000', process.env.DB_NAME);
    })
    })
    .catch((error) => {
        console.error('Failed to start server', error);
        process.exit(1);
    })
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import carRoutes from './routes/carRoutes';
import connectDB from './config/db';

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);

export default app;

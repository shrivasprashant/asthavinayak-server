import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDatabase from './config/database.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import ErrorHandler from './utils/ErrorHandler.js';
import { generatedError } from './middleware/error.js';
import indexRoutes from './routes/indexRoutes.js';
import userRoutes from "./routes/user.routes.js"

// Load environment variables from .env file
dotenv.config();

const app = express(); // ✅ Initialize app first
const port = process.env.PORT || 5000;



// Logger
app.use(logger('tiny'));

// CORS
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cookie parser
app.use(cookieParser());

// Routes

app.get('/test', (req, res) => {
    res.send('Server working');
});
app.use("/", indexRoutes); 
app.use("/api/v1/users", userRoutes);



// Error handling
app.use((req, res, next) => {
    next(new ErrorHandler( `Requested URL ${req.originalUrl} Not Found`,404));
});
app.use(generatedError);

// Connect to the database and start the server
connectDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at port ${port}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database:', error);
});

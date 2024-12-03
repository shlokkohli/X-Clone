import express from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js'
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded( {extended: true} ))

// Routes declaration
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use('/api/notifications', notificationRoutes);

export { app };
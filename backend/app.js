import express from 'express';
import authRoutes from './routes/auth.routes.js'

const app = express();

app.use(express.json())

// Routes declaration
app.use("/api/auth", authRoutes)

export { app };
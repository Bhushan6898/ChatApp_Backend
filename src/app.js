import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import conversationRoutes from './routes/conversationRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1
  response.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable' })
})
app.get('/api/connection', (_request, response) => {
  response.json({
    connected: true,
    databaseConnected: mongoose.connection.readyState === 1,
    message: 'Connection to the server is successful',
  })
})
app.use('/api/user', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use(errorHandler)

export default app
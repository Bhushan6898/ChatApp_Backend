import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import app from './app.js'
import { connectToDatabase } from './config/database.js'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

const port = Number(process.env.PORT) || 3001

try {
  await connectToDatabase()
  app.listen(port, () => {
    console.log(`Chat API listening on http://localhost:${port}`)
  })
} catch (error) {
  console.error(`Unable to start chat API: ${error.message}`)
  process.exitCode = 1
}
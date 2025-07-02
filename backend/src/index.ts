import express from 'express'
import dotenv from 'dotenv'
import gameRoutes from './routes/game'

dotenv.config()

const app = express()
app.use(express.json())

app.use('/game', gameRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

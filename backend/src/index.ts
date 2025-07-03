import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import gameRoutes from "./routes/game"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/game", gameRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

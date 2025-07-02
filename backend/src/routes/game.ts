import express from 'express'
import { createGame, revealSecret } from '../services/gameManager'

const router = express.Router()

router.post('/create', createGame)
router.post('/reveal', revealSecret)

export default router

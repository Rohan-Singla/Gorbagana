import express from 'express'
import { createGame, joinGame, revealSecret, getGameStatus } from '../services/gameManager'

const router = express.Router()

router.post('/create', async (req, res) => {
    try {
        await createGame(req, res)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.post('/join', async (req, res) => {
    try {
        await joinGame(req, res)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.post('/reveal', async (req, res) => {
    try {
        await revealSecret(req, res)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.get('/status/:id', async (req, res) => {
    try {
        await getGameStatus(req, res)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router

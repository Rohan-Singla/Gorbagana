import { Request, Response } from 'express'
import { sha256, xorHex } from '../utils/crypto'
import { transferGorToken } from './solana'
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function createGame(req: Request, res: Response) {
    const { address, commitment } = req.body

    const game = await prisma.game.create({
        data: {
            status: 'waiting',
            pot: 1,
            playerAAddress: address,
            playerACommitment: commitment
        }
    })

    res.json({ id: game.id, status: game.status })
}


export async function joinGame(req: Request, res: Response) {
    const { id, address, commitment } = req.body

    const game = await prisma.game.findUnique({ where: { id } })
    if (!game || game.status !== 'waiting') return res.status(400).json({ error: 'Invalid game' })

    await prisma.game.update({
        where: { id },
        data: {
            playerBAddress: address,
            playerBCommitment: commitment,
            status: 'ready',
            pot: 2
        }
    })

    res.json({ message: 'Game ready', id })
}


export async function revealSecret(req: Request, res: Response) {
    const { id, address, reveal } = req.body
    const game = await prisma.game.findUnique({ where: { id } })
    if (!game || game.status === 'done') return res.status(404).json({ error: 'Game not found' })

    const hash = sha256(reveal)
    let updateData = {}
    let player = null

    if (game.playerAAddress === address) {
        if (game.playerAReveal) return res.status(400).json({ error: 'Already revealed' })
        if (hash !== game.playerACommitment) return res.status(400).json({ error: 'Invalid reveal' })
        updateData = { playerAReveal: reveal }
        player = 'A'
    } else if (game.playerBAddress === address) {
        if (game.playerBReveal) return res.status(400).json({ error: 'Already revealed' })
        if (hash !== game.playerBCommitment) return res.status(400).json({ error: 'Invalid reveal' })
        updateData = { playerBReveal: reveal }
        player = 'B'
    } else {
        return res.status(400).json({ error: 'Invalid address' })
    }

    await prisma.game.update({ where: { id }, data: updateData })

    // Re-fetch to check both reveals
    const updatedGame = await prisma.game.findUnique({ where: { id } })
    if (updatedGame?.playerAReveal && updatedGame.playerBReveal) {
        const result = parseInt(
            xorHex(sha256(updatedGame.playerAReveal), sha256(updatedGame.playerBReveal)).slice(0, 2),
            16
        ) % 2
        const winner = result === 0 ? updatedGame.playerAAddress : updatedGame.playerBAddress

        await prisma.game.update({
            where: { id },
            data: { status: 'done', winner }
        })

        if (winner && updatedGame.pot) {
            await transferGorToken(winner, updatedGame.pot)
        }
        return res.json({ winner, message: 'Game complete and payout sent' })
    }

    return res.json({ message: `Reveal accepted for player ${player}` })
}


export async function getGameStatus(req: Request, res: Response) {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } })
    if (!game) return res.status(404).json({ error: 'Game not found' })
    res.json(game)
}


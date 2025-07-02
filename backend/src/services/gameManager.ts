import { Request, Response } from 'express'
import { sha256, xorHex } from '../utils/crypto'
import { transferGorToken } from './solana'
import { games } from '../db/memorystore'

export async function createGame(req: Request, res: Response) {
    const { address, commitment } = req.body
    const id = crypto.randomUUID()

    games.set(id, {
        id,
        playerA: { address, commitment },
        pot: 1,
        status: 'waiting'
    })

    res.json({ id, status: 'waiting' })
}

export async function joinGame(req: Request, res: Response) {
    const { id, address, commitment } = req.body
    const game = games.get(id)

    if (!game || game.status !== 'waiting') return res.status(400).json({ error: 'Invalid game' })

    game.playerB = { address, commitment }
    game.status = 'ready'
    game.pot = 2

    res.json({ message: 'Game ready', id })
}

export async function revealSecret(req: Request, res: Response) {
    const { id, address, reveal } = req.body
    const game = games.get(id)
    if (!game || game.status === 'done') return res.status(404).json({ error: 'Game not found' })

    const hash = sha256(reveal)

    let player = null
    if (game.playerA.address === address) {
        if (game.playerA.reveal) return res.status(400).json({ error: 'Already revealed' })
        if (hash !== game.playerA.commitment) return res.status(400).json({ error: 'Invalid reveal' })
        game.playerA.reveal = reveal
        player = 'A'
    } else if (game.playerB?.address === address) {
        if (game.playerB?.reveal) return res.status(400).json({ error: 'Already revealed' })
        if (hash !== game?.playerB?.commitment) return res.status(400).json({ error: 'Invalid reveal' })
        game.playerB.reveal = reveal
        player = 'B'
    } else {
        return res.status(400).json({ error: 'Invalid address' })
    }

    if (game.playerA.reveal && game.playerB?.reveal) {
        game.status = 'done'

        const result = parseInt(xorHex(sha256(game.playerA.reveal), sha256(game.playerB.reveal)).slice(0, 2), 16) % 2
        const winner = result === 0 ? game.playerA.address : game.playerB.address
        game.winner = winner

        await transferGorToken(winner, game.pot)

        return res.json({ winner, message: 'Game complete and payout sent' })
    }

    return res.json({ message: `Reveal accepted for player ${player}` })
}

export async function getGameStatus(req: Request, res: Response) {
    const game = games.get(req.params.id)
    if (!game) return res.status(404).json({ error: 'Game not found' })
    return res.json(game)
}

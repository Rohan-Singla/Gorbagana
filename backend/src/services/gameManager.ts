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
    if (!game) return res.status(404).json({ error: 'Game not found' })

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

    const updatedGame = await prisma.game.findUnique({ where: { id } })
    try {
        if (updatedGame?.playerAReveal && updatedGame.playerBReveal) {
            const hashA = sha256(updatedGame.playerAReveal)
            const hashB = sha256(updatedGame.playerBReveal)

            console.log("✅ Both players revealed. Proceeding to resolve winner...");
            console.log("🔹 playerAReveal:", updatedGame.playerAReveal);
            console.log("🔹 playerBReveal:", updatedGame.playerBReveal);
            console.log("🔸 hashA:", hashA);
            console.log("🔸 hashB:", hashB);

            try {
                const xor = xorHex(hashA, hashB);
                console.log("🧮 XOR result:", xor);

                const resultByte = xor.slice(0, 2);
                const result = parseInt(resultByte, 16) % 2;
                console.log("🎲 Result Byte:", resultByte, "-> Coin Flip Result:", result);

                const winner = result === 0 ? updatedGame.playerAAddress : updatedGame.playerBAddress;
                console.log("🏆 Winner:", winner);

                try {
                    await prisma.game.update({
                        where: { id },
                        data: { status: 'done', winner }
                    });
                    console.log("✅ Game updated in DB with winner.");
                } catch (dbErr) {
                    console.error("❌ Failed to update game status/winner:", dbErr);
                    return res.status(500).json({ error: "Failed to save winner" });
                }

                // if (winner && updatedGame.pot) {
                //     try {
                //         console.log("💰 Initiating payout...");
                //         await transferGorToken(winner, updatedGame.pot);
                //         console.log("✅ Payout transfer completed.");
                //     } catch (payoutErr) {
                //         console.error("❌ Failed during token transfer:", payoutErr);
                //         return res.status(500).json({ error: "Token transfer failed" });
                //     }
                // }

                return res.json({ winner, message: 'Game complete and payout sent' });
            } catch (e) {
                console.error("❌ Error during XOR/winner logic:", e);
                return res.status(500).json({ error: 'Internal Server Error during winner resolution' });
            }
        }

        console.log("🕵️ Only one player has revealed. Waiting for the other...");
        return res.json({ message: `Reveal accepted for player ${player}` });
    } catch (error) {
        console.error("❌ Top-level error finalizing game:", error);
        return res.status(500).json({ error: "Internal Server Error during winner resolution" });
    }

}


export async function getGameStatus(req: Request, res: Response) {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } })
    if (!game) return res.status(404).json({ error: 'Game not found' })
    res.json(game)
}



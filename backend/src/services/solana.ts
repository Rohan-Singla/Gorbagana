import {
    Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL
} from '@solana/web3.js'
import bs58 from 'bs58'

const connection = new Connection(process.env.RPC_URL!)
const vault = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_BASE58!))

export async function transferGorToken(to: string, amount: number) {
    const toPubkey = new PublicKey(to)

    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: vault.publicKey,
            toPubkey: toPubkey,
            lamports: amount * LAMPORTS_PER_SOL
        })
    )

    const sig = await sendAndConfirmTransaction(connection, tx, [vault])
    console.log("Payout sent:", sig)
}

import {
    Connection,
    PublicKey,
    Keypair,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js'
import {
    createTransferInstruction,
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token'
import bs58 from 'bs58'
import dotenv from 'dotenv'
dotenv.config()

const connection = new Connection(process.env.RPC_URL!, 'confirmed')

const vault = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_BASE58!))

const GOR_MINT = new PublicKey(process.env.GOR_TOKEN_MINT!)

export async function transferGorToken(to: string, amount: number) {
    const recipient = new PublicKey(to)

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        vault,
        GOR_MINT,
        vault.publicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        vault,
        GOR_MINT,
        recipient
    )

    const ix = createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        vault.publicKey,
        amount * 1_000_000
    )

    const tx = new Transaction().add(ix)
    const sig = await sendAndConfirmTransaction(connection, tx, [vault])
    console.log('GOR tokens sent:', sig)
}

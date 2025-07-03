import {
    Connection,
    PublicKey,
    Keypair,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js'
import {
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import bs58 from 'bs58'
import dotenv from 'dotenv'
dotenv.config()

const connection = new Connection(process.env.RPC_URL!, 'confirmed')

const vault = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_BASE58!))

const GOR_MINT = new PublicKey(process.env.GOR_TOKEN_MINT!)


export async function transferGorToken(to: string, amount: number) {
    console.log('🚀 Starting GOR token transfer...')
    console.log(`From: ${vault.publicKey.toBase58()}`)
    console.log(`To: ${to}`)
    console.log(`Amount: ${amount} GOR`)

    try {
        const recipient = new PublicKey(to)

        // Get sender's associated token address
        const senderATA = await getAssociatedTokenAddress(
            GOR_MINT,
            vault.publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )

        // Get recipient's associated token address
        const recipientATA = await getAssociatedTokenAddress(
            GOR_MINT,
            recipient,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )

        console.log(`Sender ATA: ${senderATA.toBase58()}`)
        console.log(`Recipient ATA: ${recipientATA.toBase58()}`)

        const instructions = []

        // Check if sender's ATA exists
        let senderATAExists = false
        try {
            await getAccount(connection, senderATA)
            senderATAExists = true
            console.log('✅ Sender ATA exists')
        } catch (err: any) {
            console.log('❌ Sender ATA does not exist, creating...')
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    vault.publicKey,  // payer
                    senderATA,        // associatedToken
                    vault.publicKey,  // owner
                    GOR_MINT,         // mint
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            )
        }

        let recipientATAExists = false
        try {
            await getAccount(connection, recipientATA)
            recipientATAExists = true
            console.log('✅ Recipient ATA exists')
        } catch (err: any) {
            console.log('❌ Recipient ATA does not exist, creating...')
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    vault.publicKey, 
                    recipientATA,    
                    recipient,   
                    GOR_MINT,        
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            )
        }

        if (senderATAExists) {
            try {
                const senderBalance = await connection.getTokenAccountBalance(senderATA)
                const decimals = senderBalance.value.decimals
                const transferAmount = amount * Math.pow(10, decimals)

                console.log(`💰 Sender balance: ${senderBalance.value.uiAmount} GOR`)
                console.log(`📊 Transfer amount: ${amount} GOR (${transferAmount} smallest units)`)
                console.log(`🔢 Token decimals: ${decimals}`)

                if (Number(senderBalance.value.amount) < transferAmount) {
                    throw new Error(`Insufficient balance. Available: ${senderBalance.value.uiAmount} GOR, Required: ${amount} GOR`)
                }

                instructions.push(
                    createTransferInstruction(
                        senderATA,         
                        recipientATA,       
                        vault.publicKey,    
                        transferAmount,    
                        [],                
                        TOKEN_PROGRAM_ID  
                    )
                )
            } catch (balanceError) {
                console.error('❌ Error checking sender balance:', balanceError)
                throw balanceError
            }
        } else {
            console.log('⚠️  Sender ATA will be created, but no tokens to transfer yet')
            console.log('⚠️  You need to fund the sender ATA first before transferring')
            console.log('🔄 Only creating token accounts, skipping transfer')
        }

        if (instructions.length === 0) {
            console.log('✅ No instructions needed, accounts already exist')
            return 'NO_INSTRUCTIONS_NEEDED'
        }

        console.log(`📝 Creating transaction with ${instructions.length} instructions...`)
        const transaction = new Transaction().add(...instructions)

        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = vault.publicKey

        console.log('📤 Sending transaction...')
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [vault],
            {
                commitment: 'confirmed',
                maxRetries: 3,
                skipPreflight: false
            }
        )

        console.log('✅ Transaction sent successfully!')
        console.log(`🔗 Transaction signature: ${signature}`)
        console.log(`🔍 View on Solscan: https://solscan.io/tx/${signature}`)

        return signature
    } catch (error) {
        console.error('❌ Error transferring GOR tokens:', error)
        throw error
    }
}

export async function checkGorBalance() {
    try {
        console.log('🔍 Checking GOR token balance...')

        const senderATA = await getAssociatedTokenAddress(
            GOR_MINT,
            vault.publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )

        try {
            const balance = await connection.getTokenAccountBalance(senderATA)
            console.log(`💰 Your GOR balance: ${balance.value.uiAmount} GOR`)
            return balance.value.uiAmount
        } catch (err) {
            console.log('❌ No GOR token account found. You need to receive GOR tokens first.')
            return 0
        }
    } catch (error) {
        console.error('❌ Error checking balance:', error)
        return 0
    }
}

export async function exampleUsage() {
    try {
        await checkGorBalance()

        const recipientAddress = "RECIPIENT_PUBLIC_KEY_HERE"
        const amountToSend = 1

        const signature = await transferGorToken(recipientAddress, amountToSend)
        console.log('✅ Transfer completed:', signature)
    } catch (error) {
        console.error('❌ Transfer failed:', error)
    }
}
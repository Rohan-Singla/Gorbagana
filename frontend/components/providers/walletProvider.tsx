"use client"

import { FC, ReactNode } from "react"
import {
    ConnectionProvider,
    WalletProvider
} from "@solana/wallet-adapter-react"

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import "@solana/wallet-adapter-react-ui/styles.css";

const endpoint = process.env.NEXT_PUBLIC_GORBAGANA_RPC ?? "https://rpc.gorbagana.wtf"

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

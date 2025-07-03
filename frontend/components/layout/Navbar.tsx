import React, { useState } from 'react'
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { motion } from "framer-motion"
import { Coins, Menu, X } from "lucide-react"
import Link from 'next/link'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const Navbar = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <motion.header
            className="relative z-50 border-b border-gray-900"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                            <Coins className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-xl font-bold text-green-400">Gorbagana</span>
                    </motion.div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                            How It Works
                        </Link>
                        <Link href="#stats" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                            Stats
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {connection && !publicKey ?
                                <WalletMultiButton />
                                :
                                <div className="flex items-center space-x-2">
                                    <WalletMultiButton />
                                    <WalletDisconnectButton className="bg-green-400 hover:bg-green-500 text-black font-semibold transition-colors duration-300" />
                                </div>
                            }
                        </motion.div>
                    </nav>

                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <motion.nav
                        className="md:hidden mt-6 pb-6 border-t border-gray-900"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex flex-col space-y-4 pt-6">
                            <Link href="#features" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                                Features
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                            >
                                How It Works
                            </Link>
                            <Link href="#stats" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                                Stats
                            </Link>
                            {connection && !publicKey ?
                                <WalletMultiButton />
                                :
                                <div className="flex items-center space-x-2">
                                    <WalletMultiButton />
                                    <WalletDisconnectButton className="bg-green-400 hover:bg-green-500 text-black font-semibold transition-colors duration-300" />
                                </div>
                            }
                        </div>
                    </motion.nav>
                )}
            </div>
        </motion.header>
    )
}

export default Navbar
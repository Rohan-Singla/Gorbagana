"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Coins, Shield, Clock, Users, X, Eye, Wallet } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import { sha256 } from "@/lib/utils"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useSearchParams } from "next/navigation"

export default function GameLobby() {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const [gameStep, setGameStep] = useState(1)
    const [opponentJoined, setOpponentJoined] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [canCancel, setCanCancel] = useState(true)
    const [showReveal, setShowReveal] = useState(false)
    const [gameId, setGameId] = useState<string | null>(null)
    const [inviteLink, setInviteLink] = useState<string>("")
    const [winner, setWinner] = useState<string | null>(null)
    const params = useSearchParams()
    const [joinId, setJoinId] = useState<string | null>(null)

    useEffect(() => {
        const id = params.get("gameId")
        setJoinId(id)
    }, [params])

    useEffect(() => {
        const setupGame = async () => {
            if (connection && !publicKey) {
                alert("Please connect your wallet to create a game")
                return
            }

            const secret = crypto.randomUUID()
            const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
            const commitment = await sha256(secret + salt)

            sessionStorage.setItem("secret", secret)
            sessionStorage.setItem("salt", salt)
            sessionStorage.setItem("commitment", commitment)

            if (joinId) {
                console.log("Joining Game Payload", joinId, publicKey?.toBase58(), commitment)
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: joinId,
                        address: publicKey?.toBase58(),
                        commitment,
                    }),
                })
                const data = await res.json()
                console.log("Joining Game Response", data)
                setGameId(data.id)
                setOpponentJoined(true)
                setGameStep(2)
                setShowReveal(true)
                setCanCancel(false)
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address: publicKey?.toBase58(),
                    commitment,
                }),
            })
            const data = await res.json()
            console.log("Game Creation Response", data)
            setGameId(data.id)
            setInviteLink(`http://localhost:3000/lobby?gameId=${data.id}`)

            const interval = setInterval(async () => {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/status/${data.id}`)
                const game = await res.json()
                if (game.status === "ready") {
                    setOpponentJoined(true)
                    setGameStep(2)
                    setShowReveal(true)
                    setCanCancel(false)
                    clearInterval(interval)
                }
                if (game.status === "done" || game.status === "complete") {
                    setWinner(game.winner)
                    clearInterval(interval)
                }
            }, 3000)
        }

        if (publicKey) {
            setupGame()
        }
    }, [publicKey])

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(`${inviteLink}`)
            setLinkCopied(true)
            setTimeout(() => setLinkCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy link")
        }
    }

    const revealSecret = async () => {
        const secret = sessionStorage.getItem("secret")
        const salt = sessionStorage.getItem("salt")
        if (!secret || !salt || !gameId) return

        const reveal = secret + salt
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/reveal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: gameId,
                address: publicKey?.toBase58(),
                reveal,
            }),
        })
        const data = await res.json()
        if (data.status === "complete") {
            setWinner(data.winner)
            setGameStep(3)
        }
    }

    const steps = [
        { id: 1, label: "Commitment Generated", icon: Shield },
        { id: 2, label: "Waiting for Opponent", icon: Clock },
        { id: 3, label: "Reveal Phase", icon: Eye },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white font-mono">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Progress Steps */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between max-w-2xl mx-auto">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <motion.div
                                            className={`flex items-center gap-4 ${gameStep >= step.id ? "text-cyan-400" : "text-slate-500"}`}
                                            animate={{
                                                color: gameStep >= step.id ? "#22d3ee" : "#64748b",
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${gameStep >= step.id
                                                        ? "bg-cyan-400/20 border-cyan-400 shadow-lg shadow-cyan-400/20"
                                                        : "bg-slate-800/50 border-slate-600"
                                                    }`}
                                            >
                                                <step.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-medium hidden sm:block min-w-max">{step.label}</span>
                                        </motion.div>
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`w-20 h-0.5 mx-6 transition-all duration-500 ${gameStep > step.id ? "bg-cyan-400" : "bg-slate-700"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Game Status Card */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl h-full">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[500px]">
                                {/* Animated Coin */}
                                <motion.div
                                    className="w-32 h-32 mb-8 relative"
                                    animate={{ rotateY: 360 }}
                                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                >
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-400/30">
                                        <Coins className="w-16 h-16 text-slate-900" />
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                    />
                                </motion.div>

                                {/* Status Text */}
                                <motion.h2
                                    className="text-3xl font-bold mb-4 text-cyan-400"
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                >
                                    {opponentJoined ? "Both Players Ready!" : "Waiting for Opponent..."}
                                </motion.h2>

                                <p className="text-slate-400 mb-8 max-w-lg text-lg leading-relaxed">
                                    {opponentJoined
                                        ? "Game is ready to begin. Click reveal when you're ready to see the results!"
                                        : "Share the invite link below to get someone to join your game."}
                                </p>

                                {inviteLink && (
                                <motion.div
                                    className="bg-slate-800/60 rounded-xl p-6 border border-slate-600/50 w-full max-w-lg mb-6"
                                    whileHover={{ borderColor: "#22d3ee", scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-cyan-400 font-mono text-sm truncate flex-1">{inviteLink}</span>
                                        <motion.button
                                            onClick={copyInviteLink}
                                            className="p-3 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 transition-all duration-200 border border-cyan-400/30"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {linkCopied ? (
                                                <Check className="w-5 h-5 text-cyan-400" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-cyan-400" />
                                            )}
                                        </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div
                                    className="flex items-center gap-3 bg-emerald-400/20 px-6 py-3 rounded-full border border-emerald-400/30"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                >
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold text-lg">0.01 GOR Committed</span>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Opponent Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl h-full">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <Users className="w-6 h-6 text-purple-400" />
                                    <h3 className="text-xl font-bold text-purple-400">Opponent Status</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!opponentJoined ? (
                                        <motion.div
                                            key="waiting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-24 h-24 bg-slate-800/60 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-slate-600">
                                                <Users className="w-10 h-10 text-slate-500" />
                                            </div>
                                            <p className="text-slate-400 text-lg mb-6">Waiting for player...</p>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-purple-400 rounded-full"
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="joined"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-400/30">
                                                <Wallet className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="text-center space-y-4">
                                                <p className="text-purple-400 font-mono text-sm bg-slate-800/40 p-3 rounded-lg">
                                                    {opponentJoined ? "Opponent Joined" : "Waiting for player..."}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-400/20 border border-emerald-400/30 rounded-lg p-4 text-center">
                                                <p className="text-emerald-400 text-lg font-medium">Ready to Play!</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.div whileHover={{ scale: canCancel ? 1.05 : 1 }} whileTap={{ scale: canCancel ? 0.95 : 1 }}>
                        <Button
                            variant="outline"
                            size="lg"
                            disabled={!canCancel}
                            className={`border-red-400/50 text-red-400 hover:bg-red-400/10 hover:border-red-400 px-8 py-4 text-lg font-medium transition-all duration-200 ${!canCancel ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <X className="w-5 h-5 mr-3" />
                            Cancel Game
                        </Button>
                    </motion.div>

                    <AnimatePresence>
                        {showReveal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={revealSecret}
                                    className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 text-slate-900 font-bold px-8 py-4 text-lg shadow-lg shadow-cyan-400/30 transition-all duration-200"
                                >
                                    <Eye className="w-5 h-5 mr-3" />
                                    Reveal Now
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Winner Display */}
                <AnimatePresence>
                    {winner && (
                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border-emerald-400/30 backdrop-blur-xl max-w-2xl mx-auto">
                                <CardContent className="p-8">
                                    <div className="text-4xl mb-4">🎉</div>
                                    <h3 className="text-3xl font-bold text-emerald-400 mb-2">Game Complete!</h3>
                                    <p className="text-xl text-slate-300">
                                        Winner:{" "}
                                        <span className="text-cyan-400 font-bold">
                                            {winner === publicKey?.toBase58() ? "You!" : `${winner.slice(0, 6)}...${winner.slice(-6)}`}
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

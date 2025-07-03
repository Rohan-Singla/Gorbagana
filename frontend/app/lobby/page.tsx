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
    const { connection } = useConnection();
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
    const [joinId, setJoinId] = useState<string | null>(null);

    useEffect(() => {
        const id = params.get("gameId");
        setJoinId(id);
    }, [params]);

    useEffect(() => {
        const setupGame = async () => {
            if (connection && !publicKey) {
                alert("Please connect your wallet to create a game");
                return;
            }

            const secret = crypto.randomUUID();
            const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            const commitment = await sha256(secret + salt);

            sessionStorage.setItem("secret", secret);
            sessionStorage.setItem("salt", salt);
            sessionStorage.setItem("commitment", commitment);

            if (joinId) {
                console.log("Joining Game Payload", joinId, publicKey?.toBase58(), commitment);

                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: joinId,
                        address: publicKey?.toBase58(),
                        commitment
                    })
                });

                const data = await res.json();
                console.log("Joining Game Response", data);

                setGameId(data.id);
                setOpponentJoined(true);
                setGameStep(2);
                setShowReveal(true);
                setCanCancel(false);
                return; // ✅ Avoid falling through to create logic
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address: publicKey?.toBase58(),
                    commitment
                })
            });

            const data = await res.json();
            console.log("Game Creation Response", data);

            setGameId(data.id);
            setInviteLink(`http://localhost:3000/lobby?gameId=${data.id}`);

            const interval = setInterval(async () => {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/status/${data.id}`);
                const game = await res.json();
                if (game.status === "ready") {
                    setOpponentJoined(true);
                    setGameStep(2);
                    setShowReveal(true);
                    setCanCancel(false);
                    clearInterval(interval);
                }
                if (game.status === "done" || game.status === "complete") {
                    setWinner(game.winner);
                    clearInterval(interval);
                }
            }, 3000);
        };

        if (publicKey) {
            setupGame();
        }
    }, [publicKey]);


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
                reveal
            })
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
        <div className="min-h-screen bg-gray-950 text-white px-4 font-mono">
            <Navbar />
            <div className="fixed inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-400 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lime-400 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">


                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <motion.div
                                            className={`flex items-center gap-3 ${gameStep >= step.id ? "text-teal-400" : "text-gray-500"}`}
                                            animate={{
                                                color: gameStep >= step.id ? "#2dd4bf" : "#6b7280",
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${gameStep >= step.id ? "bg-teal-400/20 border-teal-400" : "bg-gray-800 border-gray-600"
                                                    }`}
                                            >
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                                        </motion.div>

                                        {index < steps.length - 1 && (
                                            <div className={`w-16 h-0.5 mx-4 ${gameStep > step.id ? "bg-teal-400" : "bg-gray-700"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl h-full">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                                <motion.div
                                    className="w-32 h-32 mb-8 relative"
                                    animate={{ rotateY: 360 }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                >
                                    <div className="w-full h-full bg-gradient-to-br from-lime-400 to-teal-400 rounded-full flex items-center justify-center shadow-2xl shadow-lime-400/20">
                                        <Coins className="w-16 h-16 text-gray-900" />
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-lime-400/30"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                    />
                                </motion.div>

                                <motion.h2
                                    className="text-2xl font-bold mb-4 text-lime-400"
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                >
                                    {opponentJoined ? "Both Players Ready!" : "Waiting for opponent to join..."}
                                </motion.h2>

                                <p className="text-gray-400 mb-8 max-w-md">
                                    {opponentJoined
                                        ? "Game is ready to begin. Click reveal when you're ready to see the results!"
                                        : "Share the invite link below to get someone to join your game."}
                                </p>

                                <motion.div
                                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 w-full max-w-md"
                                    whileHover={{ borderColor: "#2dd4bf" }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-teal-400 font-mono text-sm truncate">{inviteLink}</span>
                                        <motion.button
                                            onClick={copyInviteLink}
                                            className="p-2 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {linkCopied ? (
                                                <Check className="w-4 h-4 text-teal-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-teal-400" />
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="mt-6 flex items-center gap-2 bg-lime-400/20 px-4 py-2 rounded-full border border-lime-400/30"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                >
                                    <Shield className="w-4 h-4 text-lime-400" />
                                    <span className="text-lime-400 font-bold">0.01 GOR committed</span>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-5 h-5 text-pink-400" />
                                    <h3 className="text-lg font-bold text-pink-400">Opponent</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!opponentJoined ? (
                                        <motion.div
                                            key="waiting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-8"
                                        >
                                            <div className="w-20 h-20 bg-gray-800/50 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-600">
                                                <Users className="w-8 h-8 text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Waiting for player...</p>
                                            <motion.div className="w-full h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-pink-400"
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="joined"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                                                <Wallet className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-pink-400 font-mono text-sm mb-2">9xKLmn3CW87d97TXJSDpbD5jBkhe...</p>
                                                <Badge className="bg-pink-400/20 text-pink-400 border-pink-400/30">0.01 GOR committed</Badge>
                                            </div>
                                            <div className="bg-green-400/20 border border-green-400/30 rounded-lg p-3 text-center">
                                                <p className="text-green-400 text-sm font-medium">Ready to play!</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.div whileHover={{ scale: canCancel ? 1.05 : 1 }} whileTap={{ scale: canCancel ? 0.95 : 1 }}>
                        <Button
                            variant="outline"
                            size="lg"
                            disabled={!canCancel}
                            className={`border-red-500/50 text-red-400 hover:bg-red-500/10 px-8 py-3 ${!canCancel ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <X className="w-5 h-5 mr-2" />
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
                                    className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold px-8 py-3"
                                >
                                    <Eye className="w-5 h-5 mr-2" />
                                    Reveal Now
                                </Button>

                            </motion.div>
                        )}
                        {winner && (
                            <motion.div
                                className="mt-6 text-center text-2xl font-bold text-lime-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                🎉 Winner:{" "}
                                <span className="text-pink-400">
                                    {winner === publicKey?.toBase58() ? "You!" : `${winner.slice(0, 4)}...${winner.slice(-4)}`}
                                </span>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}

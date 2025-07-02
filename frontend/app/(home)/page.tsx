"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Users, TrendingUp, Coins, Timer, Gamepad2, Wallet, Menu, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { containerVariants, itemVariants } from "./components/data"

export default function GorbaganaCoinFlip() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [glitchText, setGlitchText] = useState("GORBAGANA")
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  useEffect(() => {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    const originalText = "GORBAGANA"

    const glitchInterval = setInterval(() => {
      let glitched = ""
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < 0.1) {
          glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)]
        } else {
          glitched += originalText[i]
        }
      }
      setGlitchText(glitched)

      setTimeout(() => setGlitchText(originalText), 100)
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <motion.div className="fixed inset-0 opacity-5" style={{ y }}>
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400 rounded-full" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-green-400 rounded-full" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-green-400 rounded-full" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400 rounded-full" />
      </motion.div>

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
                <Button className="bg-green-400 hover:bg-green-500 text-black font-semibold transition-colors duration-300">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
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
                <Button className="bg-green-400 hover:bg-green-500 text-black font-semibold w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </motion.nav>
          )}
        </div>
      </motion.header>

      <section className="relative z-10 pt-32 pb-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-8 bg-gray-900 text-green-400 border-green-400/20 px-4 py-2">
                <Zap className="w-3 h-3 mr-2" />
                Powered by Gorbagana Testnet
              </Badge>
            </motion.div>

            <motion.h1 className="text-5xl md:text-7xl font-black mb-8 leading-none" variants={itemVariants}>
              <span className="text-green-400 block">{glitchText}</span>
              <span className="text-white">COINFLIP</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              The fastest, fairest coinflip game on Solana.
              <br />
              <span className="text-green-400">Instant. Fair. Pure adrenaline.</span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-green-400 hover:bg-green-500 text-black font-bold text-lg px-8 py-4 group"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Start Playing
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white text-lg px-8 py-4 bg-transparent"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              variants={containerVariants}
            >
              {[
                { value: "$2.4M", label: "Volume 24h", color: "text-green-400" },
                { value: "1,247", label: "Active Players", color: "text-white" },
                { value: "0.4s", label: "Avg Settlement", color: "text-white" },
                { value: "99.1%", label: "Uptime", color: "text-green-400" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
                  variants={itemVariants}
                  whileHover={{ y: -5, borderColor: "#4ade80" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why <span className="text-green-400">Gorbagana</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built different. Powered by Solana's lightning-fast blockchain.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Sub-second transactions on Solana. No waiting, just pure gaming action.",
                color: "text-green-400",
              },
              {
                icon: Shield,
                title: "Provably Fair",
                description: "Transparent, verifiable randomness. Every flip is cryptographically guaranteed fair.",
                color: "text-white",
              },
              {
                icon: Users,
                title: "Multiplayer",
                description: "Challenge friends or random players. Real-time multiplayer action.",
                color: "text-white",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm hover:border-green-400/30 transition-all duration-500 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${feature.color}`}>{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple. Fast. <span className="text-green-400">Degen.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three steps to glory. No complex rules, just pure 50/50 action.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: "1",
                title: "Connect & Bet",
                description: "Connect your Solana wallet and choose your bet amount. Minimum 0.01 SOL.",
              },
              {
                step: "2",
                title: "Call It",
                description: "Heads or tails? Make your call and watch the coin flip in real-time.",
              },
              {
                step: "3",
                title: "Win Big",
                description: "Instant payouts to your wallet. Double your SOL or lose it all.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-20 h-20 bg-green-400 rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl font-bold text-black">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-400">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div className="flex items-center space-x-3 mb-6 md:mb-0" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-green-400">Gorbagana CoinFlip</span>
            </motion.div>

            <div className="flex space-x-8 text-gray-500">
              {["Terms", "Privacy", "Discord", "Twitter"].map((link) => (
                <Link key={link} href="#" className="hover:text-green-400 transition-colors duration-300">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-900 text-center text-gray-600">
            <p>&copy; 2024 Gorbagana CoinFlip. Built on Solana. Play responsibly.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

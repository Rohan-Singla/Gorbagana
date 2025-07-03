import { sha256 } from "@/lib/utils"
import { useState } from "react"

export function useGameSetup() {
    const [secret, setSecret] = useState("")
    const [salt, setSalt] = useState("")
    const [commitment, setCommitment] = useState("")

    const generateCommitment = async () => {
        const _secret = Math.random().toString(36).substring(2, 10)
        const _salt = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")
        const _commit = await sha256(_secret + _salt)

        sessionStorage.setItem("secret", _secret)
        sessionStorage.setItem("salt", _salt)
        sessionStorage.setItem("commitment", _commit)

        setSecret(_secret)
        setSalt(_salt)
        setCommitment(_commit)
    }

    return { secret, salt, commitment, generateCommitment }
}

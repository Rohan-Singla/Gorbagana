interface Game {
  id: string
  playerA: {
    address: string
    commitment: string
    reveal?: string
  }
  playerB?: {
    address: string
    commitment: string
    reveal?: string
  }
  pot: number
  status: 'waiting' | 'ready' | 'revealing' | 'done'
  winner?: string
}

export const games = new Map<string, Game>()

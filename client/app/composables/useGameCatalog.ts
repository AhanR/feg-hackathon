export interface GameEntry {
  id: string
  name: string
  provider: string
  icon: string | null
  real: boolean
}

/**
 * Static lobby catalog. Placeholder games reuse the real provider icon set
 * served by the FastAPI server; Empire of Gold is the only playable game.
 */
export function useGameCatalog() {
  const { public: { prefetchBase } } = useRuntimeConfig()

  const icon = (file: string) => `/thumbnail/${file}`
  const heroArt = `/thumbnail/splashBG.jpg`

  const EMPIRE_OF_GOLD: GameEntry = {
    id: 'empire-of-gold',
    name: 'Empire of Gold',
    provider: 'SpinIQ Originals',
    icon: heroArt,
    real: true,
  }

  const fakes: GameEntry[] = [
    { id: 'royale-81', name: 'Royale 81', provider: 'SpinIQ', icon: icon('Royale_81.webp'), real: false },
    { id: 'book-of-storms', name: 'Book of Storms', provider: 'SpinIQ', icon: icon('BookOfSTorm.webp'), real: false },
    { id: 'storms-lightning', name: 'Book of Storms: Lightning Win', provider: 'SpinIQ', icon: icon('BookOfSTorm_LW.webp'), real: false },
    { id: 'frosted-market', name: 'Frosted Market Bonanza', provider: 'SpinIQ', icon: icon('Frosted_market.webp'), real: false },
    { id: 'new-conquest', name: 'Empire of Gold: New Conquest', provider: 'SpinIQ', icon: icon('EOG_NC.webp'), real: false },
    { id: 'sweet-salon', name: 'Sweet Salon', provider: 'SpinIQ', icon: icon('Seet_salon.webp'), real: false },
    { id: 'meow-meow', name: 'Meow Meow Meow', provider: 'SpinIQ', icon: icon('meow_meow_meow.webp'), real: false },
  ]

  const topPicks: GameEntry[] = [EMPIRE_OF_GOLD, ...fakes]

  const gamesRow: GameEntry[] = [
    ...fakes.slice(3),
    ...fakes.slice(0, 3),
  ]

  return { EMPIRE_OF_GOLD, topPicks, gamesRow, heroArt }
}
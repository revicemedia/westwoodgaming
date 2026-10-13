import { games } from './games'

// Kategorien für News: allgemeine Themen plus jedes Spiel
export const newsCategories = [
  { value: 'allgemein', label: 'Allgemein', image: '/WG-Logo.jpg' },
  { value: 'community', label: 'Community', image: '/WG-Logo.jpg' },
  ...games.map((game) => ({ value: game.slug, label: game.name, image: game.image })),
]

export function getNewsCategory(value: string) {
  return newsCategories.find((category) => category.value === value) ?? newsCategories[0]
}

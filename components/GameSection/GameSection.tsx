import { games } from "@/lib/games"
import Section from "./Section/Section"

export default function GameSection() {
  return (
    <div id="spiele" className="w-full h-auto scroll-mt-28 px-6 lg:px-8">
        <h2 className="mb-8 text-pretty text-3xl font-semibold text-gray-900">Unsere Spiele</h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
                <Section game={game} key={game.name} />
            ))}
        </div>
    </div>
  )
}

import Section from "./Section/Section"

const games = [
    {
        name: "EA FC 27",
        image: "/EAFC.jpg",
        category: "Community Game",
        online: 8,
    },
    {
        name: "GTA V",
        image: "/GTAVI.jpg",
        category: "Community Game",
        online: 6,
    },
    {
        name: "Battlefield 6",
        image: "/BF6.jpg",
        category: "Community Game",
        online: 1,
    },
    {
        name: "Call of Duty",
        image: "/COD.jpg",
        category: "Community Game",
        online: 4,
    }
]

export default function GameSection() {
  return (
    <div className="w-full h-auto px-6 lg:px-8">
        <h2 className="font-semibold text-2xl text-black mb-4">/ Unsere Community Spiele</h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
                <Section game={game} key={game.name} />
            ))}
        </div>
    </div>
  )
}

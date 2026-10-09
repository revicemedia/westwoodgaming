import { HeartIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Aktive Community',
    description:
      'Bei uns ist immer etwas los. Ob spontane Runde am Abend oder langer Zock-Marathon am Wochenende: Du findest jederzeit Mitspieler, die Lust auf eine gemeinsame Partie haben.',
    href: '#',
    icon: UserGroupIcon,
  },
  {
    name: 'Custom Events',
    description:
      'Turniere, Themenabende und eigene Spielmodi: Wir stellen regelmäßig Events auf die Beine, die es so nur bei uns gibt. Mitmachen kann jeder, egal ob Neuling oder Veteran.',
    href: '#',
    icon: TrophyIcon,
  },
  {
    name: 'Freundschaften',
    description:
      'Aus Mitspielern werden Freunde. Bei uns zählt der Spaß am gemeinsamen Spielen mehr als jede Statistik, und viele Bekanntschaften reichen längst über das Spiel hinaus.',
    href: '#',
    icon: HeartIcon,
  },
]

export default function TopSection() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-pretty text-4xl font-semibold text-gray-900 sm:text-5xl">
            Wir sind Westwood Gaming
          </h2>
          <p className="mt-6 text-lg/8 text-black">
            Westwood Gaming bringt Spielerinnen und Spieler zusammen, egal auf welcher Plattform. Entdecke unten unsere Spiele und werde Teil der Runde.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-md bg-black">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

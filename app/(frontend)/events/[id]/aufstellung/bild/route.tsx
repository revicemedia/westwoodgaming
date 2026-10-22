import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { ImageResponse } from 'next/og'
import { connection } from 'next/server'
import { formatEventDate } from '@/lib/eventDate'
import { getGame } from '@/lib/games'
import { getLineupSlots, getLineupWaitlist, getSignupEvent, type LineupSlot } from '@/lib/lineup'
import { groupSquads, parseTeams, signupModes, SQUAD_SIZE } from '@/lib/signupModes'

// Aufstellung als Bild (PNG, 1080 × 1350) zum Teilen im Discord

const WIDTH = 1080
const HEIGHT = 1350
const PURPLE = '#7f3aef'
const LIME = '#c6ff34'

// Schloss wie auf der Website (Heroicons lock-closed, outline)
function Lock({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

// Taktik-Icon wie auf der Aufstellungsseite (public/tactics.svg)
function Tactics({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <path d="m650.23-140-41.77-41.77 63-64-63-63 41.77-42.77 64 64 63-64L820-308.77l-64 63 64 64L777.23-140l-63-63-64 63Zm-364.81-74.58Q300-229.15 300-250t-14.58-35.42Q270.85-300 250-300t-35.42 14.58Q200-270.85 200-250t14.58 35.42Q229.15-200 250-200t35.42-14.58ZM250-140q-45.77 0-77.88-32.12Q140-204.23 140-250q0-45.77 32.12-77.88Q204.23-360 250-360q36.23 0 65.19 21.27t39.5 56.27q42.85-7.54 71-40.69 28.16-33.16 28.16-76.85v-154.23q0-78.77 55.61-134.38 55.62-55.62 134.39-55.62h60.61l-73-73L674.23-860 820-714.23 674.23-568.46l-42.77-41.77 72.62-74h-60.23q-54.23 0-92.12 37.88-37.88 37.89-37.88 92.12V-400q0 68-45.27 118.5t-112.66 59.65q-9.3 36.23-38.88 59.04Q287.46-140 250-140Zm-68.23-468.46L140-650.23l63-64-63-63L181.77-820l64 64 63-64 42.77 42.77-64 63 64 64-42.77 41.77-63-63-64 63Z" />
    </svg>
  )
}

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }

// Schrift der Website; einmal pro Server-Instanz geladen, ohne sie greift die eingebaute Schrift
let fonts: Promise<Font[]> | null = null
function loadFonts() {
  fonts ??= (async () => {
    const css = await fetch('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;700').then((res) => res.text())
    const urls = [...css.matchAll(/font-weight: (\d+);[\s\S]*?src: url\((.+?\.ttf)\)/g)]
    return Promise.all(
      urls.map(async ([, weight, url]) => ({
        name: 'Google Sans Flex',
        data: await fetch(url).then((res) => res.arrayBuffer()),
        weight: Number(weight) as 400 | 700,
        style: 'normal' as const,
      })),
    )
  })().catch(() => {
    fonts = null
    return []
  })
  return fonts
}

// Bilder aus public/ als Data-URL; über die eigene Domain zu laden blockt der SSRF-Schutz von Next für localhost
async function publicImage(path: string) {
  try {
    const data = await readFile(join(process.cwd(), 'public', path))
    const type = extname(path).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${type};base64,${data.toString('base64')}`
  } catch {
    return null
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const signup = await getSignupEvent(id)
  if (!signup) return new Response('Für dieses Event gibt es keine Anmeldung.', { status: 404 })

  const { event, mode } = signup
  const formation = signup.formation ?? []
  const game = getGame(event.game)
  const blocked: string[] = event.blockedPositions ?? []
  const [slots, waitlist, loadedFonts, gameImage, logo] = await Promise.all([
    getLineupSlots(event.id),
    getLineupWaitlist(event.id),
    loadFonts(),
    game ? publicImage(game.image) : null,
    publicImage('/WG-Logo.jpg'),
  ])
  const label = (key: string) => formation.find((position) => position.key === key)?.label ?? key
  // Reservierte Positionen zählen als belegt
  const taken = formation.filter(
    (position) => blocked.includes(position.key) || slots.some((slot) => slot.position === position.key),
  ).length

  const reservedSlots: string[] = event.reservedSlots ?? []
  const stand = `Stand: ${formatEventDate(new Date().toISOString())}`
  const muted = 'rgba(255,255,255,0.45)'

  // Eine Zeile mit Avatar und Name, für Squads und Teilnehmerliste
  const row = (key: string, content: React.ReactNode, variant: 'player' | 'reserved' | 'free', width: number) => (
    <div
      key={key}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width,
        height: 50,
        padding: '0 12px',
        borderRadius: 6,
        fontSize: 20,
        ...(variant === 'player'
          ? { background: 'rgba(255,255,255,0.06)', fontWeight: 700 }
          : variant === 'reserved'
            ? { background: 'rgba(127,58,239,0.3)', color: 'rgba(255,255,255,0.75)' }
            : { border: '2px dashed rgba(255,255,255,0.2)', color: muted }),
      }}
    >
      {content}
    </div>
  )
  const avatar = (slot: LineupSlot) =>
    slot.discordAvatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={slot.discordAvatar} alt="" width={34} height={34} style={{ borderRadius: 999 }} />
    ) : (
      <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: PURPLE, fontSize: 16, fontWeight: 700 }}>
        {slot.discordName.slice(0, 1).toUpperCase()}
      </div>
    )
  const waitlistLine = waitlist.length > 0 && (
    <div style={{ display: 'flex', marginTop: 'auto', fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
      <span style={{ fontWeight: 700, color: '#fff', marginRight: 10 }}>Warteliste:</span>
      {waitlist.slice(0, 8).map((entry) => entry.discordName).join(', ')}
      {waitlist.length > 8 ? ` + ${waitlist.length - 8} weitere` : ''}
    </div>
  )
  const heading = (title: string, sub: string) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>{title}</div>
        <div style={{ display: 'flex', marginTop: 4, fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', fontSize: 16, color: muted }}>{stand}</div>
    </div>
  )

  // Battlefield: bis zu vier Squad-Karten, zwei pro Reihe
  const squads = groupSquads(slots, reservedSlots)
  const cardWidth = (WIDTH - 112 - 24) / 2
  const squadsBody = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '28px 56px 0' }}>
      {heading(
        'Squads',
        `${slots.length} Spieler in ${squads.length} ${squads.length === 1 ? 'Squad' : 'Squads'}${event.maxSquads ? ` (max. ${event.maxSquads})` : ''}`,
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {squads.slice(0, 4).map((squad) => (
          <div key={squad.number} style={{ display: 'flex', flexDirection: 'column', width: cardWidth, padding: 20, gap: 10, borderRadius: 8, background: '#111827' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', fontSize: 26, fontWeight: 700 }}>Squad {squad.number}</div>
              <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, padding: '1px 8px', borderRadius: 4, ...(squad.free.length === 0 ? { background: LIME, color: '#000' } : { background: 'rgba(255,255,255,0.1)' }) }}>
                {squad.members.length + squad.reserved.length}/{SQUAD_SIZE}
              </div>
            </div>
            {squad.members.map((member, index) =>
              row(
                member.discordId,
                [
                  <div key="a" style={{ display: 'flex' }}>{avatar(member)}</div>,
                  <div key="n" style={{ display: 'flex', flexGrow: 1 }}>{member.discordName}</div>,
                  index === 0 ? <div key="l" style={{ display: 'flex', alignItems: 'center', height: 24, background: PURPLE, borderRadius: 4, padding: '0 8px', fontSize: 15 }}>Leader</div> : null,
                ],
                'player',
                cardWidth - 40,
              ),
            )}
            {squad.reserved.map((key) =>
              row(key, [<Lock key="l" size={20} color="#fff" />, <div key="t" style={{ display: 'flex' }}>Reserviert</div>], 'reserved', cardWidth - 40),
            )}
            {squad.free.map((key) => row(key, <div style={{ display: 'flex' }}>Freier Platz</div>, 'free', cardWidth - 40))}
          </div>
        ))}
        {squads.length === 0 && <div style={{ display: 'flex', fontSize: 22, color: muted }}>Noch kein Squad eröffnet.</div>}
      </div>
      {squads.length > 4 && (
        <div style={{ display: 'flex', marginTop: 16, fontSize: 20, color: muted }}>+ {squads.length - 4} weitere Squads auf westwood-gaming.de</div>
      )}
      <div style={{ display: 'flex', flex: 1, paddingBottom: 8 }}>{waitlistLine}</div>
    </div>
  )

  // Call of Duty: Teilnehmerliste in zwei Spalten; beim Custom Match nach dem Mischen Team A und B
  const listWidth = (WIDTH - 112 - 20) / 2
  const shown = slots.slice(0, 22)
  const teams = mode === 'cod-custom' ? parseTeams(event.teams) : null
  const byId = (id: string) => slots.find((slot) => slot.discordId === id)
  const teamColumns = teams
    ? [
        { name: 'Team A', members: teams.a.flatMap((id) => byId(id) ?? []).slice(0, 11), accent: { background: LIME, color: '#000' } },
        { name: 'Team B', members: teams.b.flatMap((id) => byId(id) ?? []).slice(0, 11), accent: { background: PURPLE, color: '#fff' } },
      ]
    : []
  const unassigned = teams ? slots.filter((slot) => !teams.a.includes(slot.discordId) && !teams.b.includes(slot.discordId)) : []
  const listBody = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '28px 56px 0' }}>
      {heading(
        mode === 'formation' ? '' : signupModes[mode].label,
        event.maxPlayers
          ? `${slots.length + reservedSlots.length} von ${event.maxPlayers} Plätzen belegt`
          : `${slots.length} Spieler dabei`,
      )}
      {teams ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {teamColumns.map((team) => (
              <div key={team.name} style={{ display: 'flex', flexDirection: 'column', width: listWidth, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', padding: '2px 12px', borderRadius: 4, fontSize: 22, fontWeight: 700, ...team.accent }}>{team.name}</div>
                  <div style={{ display: 'flex', fontSize: 18, color: muted }}>Runde {teams.round}</div>
                </div>
                {team.members.map((player) =>
                  row(player.discordId, [
                    <div key="a" style={{ display: 'flex' }}>{avatar(player)}</div>,
                    <div key="n" style={{ display: 'flex', flexGrow: 1 }}>{player.discordName}</div>,
                  ], 'player', listWidth),
                )}
              </div>
            ))}
          </div>
          {unassigned.length > 0 && (
            <div style={{ display: 'flex', marginTop: 16, fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ fontWeight: 700, color: '#fff', marginRight: 10 }}>Noch nicht eingeteilt:</span>
              {unassigned.slice(0, 8).map((slot) => slot.discordName).join(', ')}
            </div>
          )}
        </div>
      ) : (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
        {shown.map((player, index) =>
          row(
            player.discordId,
            [
              <div key="i" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 28, height: 34, fontSize: 16, color: muted }}>{index + 1}.</div>,
              <div key="a" style={{ display: 'flex' }}>{avatar(player)}</div>,
              <div key="n" style={{ display: 'flex', flexGrow: 1 }}>{player.discordName}</div>,
            ],
            'player',
            listWidth,
          ),
        )}
        {reservedSlots.slice(0, Math.max(0, 24 - shown.length)).map((key) =>
          row(key, [<Lock key="l" size={20} color="#fff" />, <div key="t" style={{ display: 'flex' }}>Reserviert</div>], 'reserved', listWidth),
        )}
        {slots.length === 0 && reservedSlots.length === 0 && <div style={{ display: 'flex', fontSize: 22, color: muted }}>Noch niemand dabei.</div>}
      </div>
      )}
      {!teams && slots.length > shown.length && (
        <div style={{ display: 'flex', marginTop: 14, fontSize: 20, color: muted }}>+ {slots.length - shown.length} weitere auf westwood-gaming.de</div>
      )}
      <div style={{ display: 'flex', flex: 1, paddingBottom: 8 }}>{waitlistLine}</div>
    </div>
  )

  const pitchWidth = 660
  const pitchHeight = 880
  const circle = 78

  const image = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', fontFamily: 'Google Sans Flex' }}>
      {/* Kopf mit Spielbild */}
      <div style={{ position: 'relative', display: 'flex', height: 300, padding: '0 56px 36px', alignItems: 'flex-end' }}>
        {gameImage && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img src={gameImage} width={WIDTH} height={300} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover', objectPosition: 'top' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: 300, display: 'flex', backgroundImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {game && <div style={{ display: 'flex', border: '1px solid #fff', borderRadius: 4, padding: '2px 10px', fontSize: 20 }}>{game.name}</div>}
          </div>
          <div style={{ display: 'flex', marginTop: 16, fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{event.title}</div>
          <div style={{ display: 'flex', marginTop: 12, fontSize: 30, fontWeight: 700, color: LIME }}>
            {mode === 'formation' ? 'Anpfiff' : 'Start'}: {formatEventDate(event.date)}
          </div>
        </div>
      </div>

      {mode === 'squads' ? squadsBody : mode !== 'formation' ? listBody : (
      <div style={{ display: 'flex', flex: 1, gap: 36, padding: '24px 56px 0' }}>
        {/* Spielfeld */}
        <div style={{ position: 'relative', display: 'flex', width: pitchWidth, height: pitchHeight, background: '#111827', borderRadius: 8 }}>
          <div style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, display: 'flex', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: pitchHeight / 2, left: 18, right: 18, display: 'flex', borderTop: '2px solid rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', top: pitchHeight / 2 - 70, left: pitchWidth / 2 - 70, width: 140, height: 140, display: 'flex', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 999 }} />
          <div style={{ position: 'absolute', top: 18, left: pitchWidth / 4, width: pitchWidth / 2, height: pitchHeight * 0.15, display: 'flex', border: '2px solid rgba(255,255,255,0.15)', borderTop: 'none' }} />
          <div style={{ position: 'absolute', bottom: 18, left: pitchWidth / 4, width: pitchWidth / 2, height: pitchHeight * 0.15, display: 'flex', border: '2px solid rgba(255,255,255,0.15)', borderBottom: 'none' }} />

          {formation.map((position) => {
            const slot = slots.find((entry) => entry.position === position.key)
            const locked = !slot && blocked.includes(position.key)
            return (
              <div
                key={position.key}
                style={{
                  position: 'absolute',
                  left: (position.x / 100) * pitchWidth - 70,
                  top: (position.y / 100) * pitchHeight - circle / 2,
                  width: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {slot?.discordAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.discordAvatar} alt="" width={circle} height={circle} style={{ borderRadius: 999, border: `3px solid ${LIME}` }} />
                ) : (
                  <div
                    style={{
                      width: circle,
                      height: circle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: 999,
                      fontSize: 22,
                      fontWeight: 700,
                      ...(slot
                        ? { background: PURPLE, border: `3px solid ${LIME}` }
                        : locked
                          ? { background: 'rgba(127,58,239,0.35)', border: `3px solid ${PURPLE}`, color: 'rgba(255,255,255,0.7)' }
                          : { border: '3px dashed rgba(255,255,255,0.5)' }),
                    }}
                  >
                    {slot ? slot.discordName.slice(0, 1).toUpperCase() : position.label}
                    {locked && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 30,
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 999,
                          background: PURPLE,
                          border: '3px solid #111827',
                        }}
                      >
                        <Lock size={16} color="#fff" />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.75)', borderRadius: 4, padding: '1px 8px', fontSize: 18, fontWeight: 700, maxWidth: 140, overflow: 'hidden' }}>
                  {slot ? slot.discordName : locked ? 'reserviert' : 'frei'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700 }}>Aufstellung</div>
          {/* Formation mit Taktik-Icon wie auf der Website */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 20, fontWeight: 700, color: PURPLE }}>
            <Tactics size={22} color={PURPLE} />
            {event.formation}
          </div>
          <div style={{ display: 'flex', marginTop: 4, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
            {taken} von {formation.length} Positionen belegt
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, gap: 8 }}>
            {formation.map((position) => {
              const slot = slots.find((entry) => entry.position === position.key)
              const locked = !slot && blocked.includes(position.key)
              return (
                <div key={position.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
                  <div style={{ display: 'flex', width: 52, fontWeight: 700, color: LIME }}>{position.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: slot ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                    {locked && <Lock size={18} color={PURPLE} />}
                    {slot ? slot.discordName : locked ? 'reserviert' : 'frei'}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', marginTop: 14, fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>
            Stand: {formatEventDate(new Date().toISOString())}
          </div>

          {waitlist.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28 }}>
              <div style={{ display: 'flex', fontSize: 26, fontWeight: 700 }}>Warteliste</div>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, gap: 8 }}>
                {waitlist.slice(0, 6).map((entry, index) => (
                  <div key={entry.discordId} style={{ display: 'flex', gap: 10, fontSize: 20 }}>
                    <div style={{ display: 'flex', width: 28, color: 'rgba(255,255,255,0.45)' }}>{index + 1}.</div>
                    <div style={{ display: 'flex' }}>{entry.discordName}</div>
                    <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)' }}>({label(entry.position)})</div>
                  </div>
                ))}
                {waitlist.length > 6 && (
                  <div style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.45)' }}>+ {waitlist.length - 6} weitere</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      )}

      {/* Fuß */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 56px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={52} height={52} style={{ borderRadius: 6 }} />
          )}
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 700 }}>Westwood Gaming</div>
        </div>
        {/* Hinweis auf die Website für alle, die das Bild geteilt bekommen */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>Mitspielen? Alle Infos auf</div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: LIME }}>westwood-gaming.de</div>
        </div>
      </div>
    </div>
  )

  return new ImageResponse(image, {
    width: WIDTH,
    height: HEIGHT,
    fonts: loadedFonts.length > 0 ? loadedFonts : undefined,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `inline; filename="aufstellung-${event.id}.png"`,
    },
  })
}

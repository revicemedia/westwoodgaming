'use server'

import config from '@payload-config'
import { refresh } from 'next/cache'
import { getPayload } from 'payload'
import { getDiscordUser } from '@/lib/discordAuth'
import { getLineupEvent, getSignupEvent, isAdmin } from '@/lib/lineup'
import { randomInt } from 'node:crypto'
import { canOpenSquad, groupSquads, listCapacity, parseSquadKey, parseTeams, playerKey, shuffleTeams, spotKey, squadKey } from '@/lib/signupModes'

export type LineupResult = { error?: string }

const isBlocked = (event: { blockedPositions?: string[] | null }, position: string) =>
  Boolean(event.blockedPositions?.includes(position))

// Auf eine Position eintragen; ein bestehender eigener Platz oder Wartelisten-Eintrag wird dabei freigegeben
export async function claimPosition(eventId: string, position: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }
  if (isBlocked(lineup.event, position)) return { error: 'Diese Position ist vom Admin reserviert.' }

  const payload = await getPayload({ config })
  const event = lineup.event.id

  const { docs } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: event }, position: { equals: position } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0] && docs[0].discordId !== user.id) return { error: 'Diese Position ist schon vergeben.' }
  if (docs[0]) return {}

  // Der alte Platz wird frei; der Hook an lineup-slots lässt dort jemanden von der Warteliste nachrücken
  await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  try {
    await payload.create({
      collection: 'lineup-slots',
      data: { event, position, discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: jemand war schneller
    refresh()
    return { error: 'Diese Position wurde gerade vergeben.' }
  }

  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Austragen, für alle Anmeldetypen (Position, Squad-Platz, Teilnehmerliste)
export async function leavePosition(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const lineup = await getSignupEvent(eventId)
  if (!lineup) return { error: 'Für dieses Event gibt es keine Anmeldung.' }

  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: lineup.event.id }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Auf die Warteliste für eine vergebene oder gesperrte Position; ein bestehender Eintrag behält seinen Rang
export async function joinWaitlist(eventId: string, position: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }

  const payload = await getPayload({ config })
  const event = lineup.event.id

  const { docs: slots } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: event } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  if (slots.some((slot) => slot.discordId === user.id)) {
    return { error: 'Du stehst schon in der Aufstellung. Gib erst deinen Platz frei, um auf die Warteliste zu gehen.' }
  }
  // Inzwischen frei geworden: direkt eintragen statt warten
  if (!isBlocked(lineup.event, position) && !slots.some((slot) => slot.position === position)) {
    return claimPosition(eventId, position)
  }

  const { docs } = await payload.find({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  try {
    if (docs[0]) {
      await payload.update({ collection: 'lineup-waitlist', id: docs[0].id, data: { position }, overrideAccess: true })
    } else {
      await payload.create({
        collection: 'lineup-waitlist',
        data: { event, position, discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
        overrideAccess: true,
      })
    }
  } catch {
    // Eindeutiger Index: doppelter Klick
  }

  refresh()
  return {}
}

// Warteliste verlassen, für alle Anmeldetypen
export async function leaveWaitlist(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const lineup = await getSignupEvent(eventId)
  if (!lineup) return { error: 'Für dieses Event gibt es keine Anmeldung.' }

  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: lineup.event.id }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Admin (Discord-ID mit lineupAdmin in lib/admins.ts): freie Position für die Session sperren oder wieder freigeben.
// Beim Freigeben rückt über den Hook an events der Erste von der Warteliste nach.
export async function toggleBlocked(eventId: string, position: string): Promise<LineupResult> {
  if (!(await isAdmin())) return { error: 'Nur für Admins.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const blocked = lineup.event.blockedPositions ?? []

  if (!blocked.includes(position as (typeof blocked)[number])) {
    const { totalDocs } = await payload.count({
      collection: 'lineup-slots',
      where: { event: { equals: event }, position: { equals: position } },
      overrideAccess: true,
    })
    if (totalDocs > 0) return { error: 'Auf dieser Position steht schon jemand. Erst austragen, dann sperren.' }
  }

  await payload.update({
    collection: 'events',
    id: event,
    data: {
      blockedPositions: blocked.includes(position as (typeof blocked)[number])
        ? blocked.filter((key) => key !== position)
        : [...blocked, position as (typeof blocked)[number]],
    },
    overrideAccess: true,
  })

  refresh()
  return {}
}

async function eventSlots(eventId: number) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: eventId } },
    sort: 'createdAt',
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs
}

// Battlefield: in einen Squad eintragen. Ein neuer Squad öffnet erst, wenn alle bestehenden voll sind
// (reservierte Plätze zählen als belegt) und „Max. Squads“ es zulässt. Wer zuerst im Squad ist, ist Squad-Leader.
export async function joinSquad(eventId: string, squad: number): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const signup = await getSignupEvent(eventId)
  if (signup?.mode !== 'squads') return { error: 'Dieses Event hat keine Squads.' }

  const payload = await getPayload({ config })
  const event = signup.event.id
  const docs = await eventSlots(event)
  const own = docs.find((slot) => slot.discordId === user.id)
  if (own && parseSquadKey(own.position)?.squad === squad) return {}

  // Ohne den eigenen Platz rechnen, damit ein Wechsel den alten Squad nicht als voll zählt
  const squads = groupSquads(
    docs.filter((slot) => slot !== own),
    signup.event.reservedSlots ?? [],
  )
  const target = squads.find((entry) => entry.number === squad)
  let position: string
  if (target) {
    if (target.free.length === 0) return { error: `Squad ${squad} ist schon voll.` }
    position = target.free[0]
  } else if (squad === squads.length + 1 && canOpenSquad(squads, signup.event.maxSquads)) {
    position = squadKey(squad, 1)
  } else {
    return { error: 'Ein neuer Squad öffnet erst, wenn alle anderen voll sind.' }
  }

  if (own) await payload.delete({ collection: 'lineup-slots', id: own.id, overrideAccess: true })
  try {
    await payload.create({
      collection: 'lineup-slots',
      data: { event, position, discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: jemand war schneller
    refresh()
    return { error: 'Der Platz wurde gerade vergeben. Bitte versuch es noch einmal.' }
  }
  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Call of Duty (Custom Match, Open Lobby): in die Teilnehmerliste eintragen, solange „Max. Teilnehmer“ es zulässt
export async function joinList(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const signup = await getSignupEvent(eventId)
  if (signup?.mode !== 'cod-custom' && signup?.mode !== 'cod-lobby') {
    return { error: 'Für dieses Event gibt es keine Teilnehmerliste.' }
  }

  const payload = await getPayload({ config })
  const event = signup.event.id
  const docs = await eventSlots(event)
  if (docs.some((slot) => slot.discordId === user.id)) return {}
  if (listCapacity(signup.event.maxPlayers, signup.event.reservedSlots ?? [], docs.length) === 0) {
    return { error: 'Die Liste ist voll. Setz dich auf die Warteliste.' }
  }

  try {
    await payload.create({
      collection: 'lineup-slots',
      data: { event, position: playerKey(user.id), discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: schon eingetragen
  }
  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Squads/Teilnehmerliste: auf die Warteliste, wenn kein Platz mehr frei ist
export async function joinSignupWaitlist(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const signup = await getSignupEvent(eventId)
  if (!signup || signup.mode === 'formation') return { error: 'Für dieses Event gibt es keine Anmeldung.' }

  const payload = await getPayload({ config })
  const event = signup.event.id
  const docs = await eventSlots(event)
  if (docs.some((slot) => slot.discordId === user.id)) return { error: 'Du bist schon eingetragen.' }

  const reserved = signup.event.reservedSlots ?? []
  const hasRoom =
    signup.mode === 'squads'
      ? (() => {
          const squads = groupSquads(docs, reserved)
          return squads.some((squad) => squad.free.length > 0) || canOpenSquad(squads, signup.event.maxSquads)
        })()
      : listCapacity(signup.event.maxPlayers, reserved, docs.length) !== 0
  if (hasRoom) return { error: 'Es ist noch ein Platz frei. Trag dich direkt ein.' }

  try {
    await payload.create({
      collection: 'lineup-waitlist',
      data: { event, position: 'any', discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: schon auf der Warteliste
  }

  refresh()
  return {}
}

// Admin: Squad-Platz bzw. Listenplatz reservieren oder freigeben.
// Squads: key = freier Platz in einem bestehenden Squad; Liste: key = 'new' reserviert einen weiteren Platz.
export async function toggleReserved(eventId: string, key: string): Promise<LineupResult> {
  if (!(await isAdmin())) return { error: 'Nur für Admins.' }

  const signup = await getSignupEvent(eventId)
  if (!signup || signup.mode === 'formation') return { error: 'Für dieses Event gibt es keine Anmeldung.' }

  const payload = await getPayload({ config })
  const event = signup.event.id
  const reserved = signup.event.reservedSlots ?? []
  let next: string[]

  if (reserved.includes(key)) {
    next = reserved.filter((entry) => entry !== key)
  } else if (signup.mode === 'squads') {
    const squads = groupSquads(await eventSlots(event), reserved)
    if (!squads.some((squad) => squad.free.includes(key))) return { error: 'Dieser Platz ist nicht frei.' }
    next = [...reserved, key]
  } else {
    if (key !== 'new') return { error: 'Unbekannter Platz.' }
    if (listCapacity(signup.event.maxPlayers, reserved, (await eventSlots(event)).length) === 0) {
      return { error: 'Die Liste ist voll, es gibt keinen Platz zum Reservieren.' }
    }
    let index = 1
    while (reserved.includes(spotKey(index))) index++
    next = [...reserved, spotKey(index)]
  }

  // Beim Freigeben lässt der Hook an events die Warteliste nachrücken
  await payload.update({ collection: 'events', id: event, data: { reservedSlots: next }, overrideAccess: true })

  refresh()
  return {}
}

// Admin, Custom Match: alle aktuellen Zusagen zufällig auf Team A und B verteilen; jede Runde zählt hoch
export async function shuffleCustomTeams(eventId: string): Promise<LineupResult> {
  if (!(await isAdmin())) return { error: 'Nur für Admins.' }

  const signup = await getSignupEvent(eventId)
  if (signup?.mode !== 'cod-custom') return { error: 'Teams gibt es nur beim Custom Match.' }

  const players = (await eventSlots(signup.event.id)).map((slot) => slot.discordId)
  if (players.length < 2) return { error: 'Zum Mischen braucht es mindestens zwei Zusagen.' }

  const previous = parseTeams(signup.event.teams)
  const teams = shuffleTeams(players, previous, () => randomInt(1_000_000) / 1_000_000)
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'events',
    id: signup.event.id,
    data: { teams: { ...teams, round: (previous?.round ?? 0) + 1, at: new Date().toISOString() } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* Angepasst für Cache Components (Suspense + await connection()). */
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

// Der Admin-Bereich darf bei der Navigation blockieren (keine Instant-Validierung)
export const instant = false

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

// Cache Components: Admin-Seiten werden immer zur Laufzeit gerendert. Die
// Suspense-Grenze in der Seite selbst erlaubt Next, die Metadaten nachzuladen.
const DynamicPage = async ({ params, searchParams }: Args) => {
  await connection()

  return RootPage({ config, params, searchParams, importMap })
}

const Page = (args: Args) => (
  <Suspense fallback={null}>
    <DynamicPage {...args} />
  </Suspense>
)

export default Page

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* Angepasst für Cache Components (siehe DynamicLayout). */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { connection } from 'next/server'
import React, { Suspense } from 'react'

import { importMap } from './admin/importMap.js'

// Der Admin-Bereich darf bei der Navigation blockieren (keine Instant-Validierung)
export const instant = false

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// Der Admin-Bereich ist immer dynamisch. Mit Cache Components muss das vor
// dem ersten Payload-Aufruf feststehen, sonst bricht das Prerendering ab.
const DynamicLayout = async ({ children }: Args) => {
  await connection()

  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

const Layout = ({ children }: Args) => (
  <Suspense fallback={null}>
    <DynamicLayout>{children}</DynamicLayout>
  </Suspense>
)

export default Layout

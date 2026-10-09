import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'

const WIDTH = 1200
const IMAGE_HEIGHT = 675
const HEIGHT = 900

// Zeichnet die Event Card der Website als PNG für die Discord-Ankündigung
export async function renderEventCard(card: { image: string; game: string; date: string; title: string; description: string }) {
  const [image, regular, semibold] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', card.image)),
    readFile(path.join(process.cwd(), 'lib', 'fonts', 'GoogleSansFlex-400.ttf')),
    readFile(path.join(process.cwd(), 'lib', 'fonts', 'GoogleSansFlex-600.ttf')),
  ])

  const response = new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: WIDTH,
          height: HEIGHT,
          backgroundColor: 'black',
          fontFamily: 'Google Sans Flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={`data:image/jpeg;base64,${image.toString('base64')}`}
          width={WIDTH}
          height={IMAGE_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: IMAGE_HEIGHT / 3,
            left: 0,
            width: WIDTH,
            height: (IMAGE_HEIGHT * 2) / 3 + 2,
            backgroundImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 26%, rgba(0,0,0,0.5) 54%, rgba(0,0,0,0.1) 82%, transparent 100%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            position: 'absolute',
            left: 56,
            right: 56,
            bottom: 56,
          }}
        >
          <div
            style={{
              display: 'flex',
              border: '2px solid white',
              borderRadius: 6,
              padding: '4px 14px',
              fontSize: 30,
              color: 'white',
            }}
          >
            {card.game}
          </div>
          <div style={{ marginTop: 24, fontSize: 64, fontWeight: 600, lineHeight: 1.15, color: 'white' }}>{card.title}</div>
          <div style={{ marginTop: 8, fontSize: 34, color: 'white' }}>{card.date}</div>
          <div
            style={{
              display: 'block',
              marginTop: 16,
              fontSize: 34,
              lineHeight: 1.4,
              color: '#d1d5db',
              lineClamp: 3,
            }}
          >
            {card.description}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Google Sans Flex', data: new Uint8Array(regular).buffer, weight: 400, style: 'normal' },
        { name: 'Google Sans Flex', data: new Uint8Array(semibold).buffer, weight: 600, style: 'normal' },
      ],
    },
  )

  return response.blob()
}

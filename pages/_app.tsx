// pages/_app.tsx

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/Navbar'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <html lang="en">
      <head>
        <title>Next.js App</title>
      </head>
      <body>
        <Navbar />
        <Component {...pageProps} />
        <SpeedInsights />
      </body>
    </html>
  )
}

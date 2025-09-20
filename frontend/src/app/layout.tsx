// @file frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
})

const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
})

export const metadata: Metadata = {
    title: 'MistralCodeMentor | AI-Powered Code Learning',
    description: 'Learn to code with AI assistance in a secure environment. Interactive coding platform with progressive hints and real-time feedback.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
            style={{
                background: 'var(--background)',
                color: 'var(--foreground)'
            }}
        >
        {children}
        </body>
        </html>
    )
}

'use client'

import './globals.css'
import { ThemeProvider } from '../lib/ThemeContext'
import { AuthProvider } from '../lib/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('theme')
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                }
                document.documentElement.classList.add(theme)
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


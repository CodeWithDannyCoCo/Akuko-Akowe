import './globals.css'
import ClientLayout from './ClientLayout'
import HealthCheck from '../components/HealthCheck'
import { NotificationProvider } from '../lib/NotificationContext'
import { AuthProvider } from '../lib/AuthContext'

export const metadata = {
  title: 'Chronicle',
  description: 'Share your stories with the world',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <ClientLayout>{children}</ClientLayout>
            {/* Temporarily disabled HealthCheck
            <div className="fixed bottom-4 left-4 z-50">
              <HealthCheck />
            </div>
            */}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


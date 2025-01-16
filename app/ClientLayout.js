'use client'

import { ThemeProvider } from '../lib/ThemeContext'
import { AuthProvider } from '../lib/AuthContext'
import HealthCheck from '../components/HealthCheck'

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <HealthCheck />
      </AuthProvider>
    </ThemeProvider>
  )
} 
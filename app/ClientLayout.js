'use client'

import { ThemeProvider } from '../lib/ThemeContext'
import HealthCheck from '../components/HealthCheck'

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
      {/* Temporarily disabled HealthCheck
      <HealthCheck />
      */}
    </ThemeProvider>
  )
} 
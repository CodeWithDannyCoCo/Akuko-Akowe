'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Logo({ variant = 'full', className = '' }) {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Check initial dark mode
        if (typeof window !== 'undefined') {
            setIsDark(document.documentElement.classList.contains('dark'))

            // Create observer for dark mode changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        setIsDark(document.documentElement.classList.contains('dark'))
                    }
                })
            })

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
            })

            return () => observer.disconnect()
        }
    }, [])

    return (
        <div className={`flex flex-row items-center ${className}`}>
            <Image
                src="/Brand/Logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="mr-3"
                priority
            />
            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
                } ${variant === 'icon' ? 'sm:hidden' : ''}`}>
                Akúkò <span className="text-blue-600 dark:text-blue-400">Akòwé</span>
            </h1>
        </div>
    )
}

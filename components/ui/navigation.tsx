'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Brain, Menu, X, Home, FileText, Folder, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/writings', label: 'Writings', icon: FileText },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-8 w-8 text-cyan-400 transition-colors duration-300 group-hover:text-purple-400" />
              <div className="absolute inset-0 animate-ping">
                <Brain className="h-8 w-8 text-cyan-400 opacity-20" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
              NEGENTROPER
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-2 text-gray-300 transition-colors duration-300 hover:text-cyan-400"
                >
                  <Icon className="h-4 w-4 group-hover:animate-pulse" />
                  <span className="font-mono text-sm">
                    {item.label.toUpperCase()}
                  </span>
                </Link>
              )
            })}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-cyan-400"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-gray-800 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-2 text-gray-300 transition-colors duration-300 hover:text-cyan-400"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-mono">
                      {item.label.toUpperCase()}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

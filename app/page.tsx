'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Brain,
  Cpu,
  Zap,
  Code,
  Database,
  Sparkles,
  Terminal,
  Rocket,
} from 'lucide-react'
import { ParticleSystem } from '@/components/ui/particles'

// Neural Network Background Component
const NeuralNetwork = () => {
  const [nodes, setNodes] = useState<
    Array<{ x: number; y: number; id: number }>
  >([])

  useEffect(() => {
    const generateNodes = () => {
      const newNodes = Array.from({ length: 25 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        id: i,
      }))
      setNodes(newNodes)
    }
    generateNodes()
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        {/* Neural connections */}
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((targetNode, j) => {
            const distance = Math.sqrt(
              Math.pow(node.x - targetNode.x, 2) +
                Math.pow(node.y - targetNode.y, 2)
            )
            if (distance < 20) {
              return (
                <line
                  key={`${node.id}-${targetNode.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="url(#neuralGradient)"
                  strokeWidth="0.1"
                  className="animate-pulse"
                />
              )
            }
            return null
          })
        )}

        {/* Neural nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="0.3"
            fill="url(#nodeGradient)"
            className="animate-pulse"
          />
        ))}

        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          <linearGradient
            id="neuralGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Matrix Rain Effect
const MatrixRain = () => {
  const [drops, setDrops] = useState<
    Array<{ id: number; x: number; delay: number }>
  >([])

  useEffect(() => {
    const newDrops = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: i * 6.67 + Math.random() * 3,
      delay: Math.random() * 2,
    }))
    setDrops(newDrops)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute font-mono text-xs text-green-400"
          style={{
            left: `${drop.x}%`,
            animationDelay: `${drop.delay}s`,
          }}
        >
          <div className="animate-bounce-slow">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="opacity-80"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Glitch Text Component
const GlitchText = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="animate-glitch-1 absolute left-0 top-0 w-full text-red-500 opacity-70"
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="animate-glitch-2 absolute left-0 top-0 w-full text-blue-500 opacity-70"
        aria-hidden="true"
      >
        {children}
      </span>
    </div>
  )
}

// Floating Geometric Shapes
const FloatingShapes = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className={`animate-float absolute opacity-20 ${
            i % 2 === 0 ? 'animate-spin-slow' : 'animate-reverse-spin'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `scale(${0.5 + Math.random() * 1.5})`,
          }}
        >
          {i % 4 === 0 && (
            <div className="h-8 w-8 rotate-45 transform border-2 border-blue-400"></div>
          )}
          {i % 4 === 1 && (
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
          )}
          {i % 4 === 2 && (
            <div className="h-2 w-10 bg-gradient-to-r from-green-400 to-blue-400"></div>
          )}
          {i % 4 === 3 && (
            <div className="h-0 w-0 border-b-8 border-l-4 border-r-4 border-b-yellow-400 border-l-transparent border-r-transparent"></div>
          )}
        </div>
      ))}
    </div>
  )
}

// Terminal Window Component
const TerminalWindow = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className="transform overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center space-x-2 border-b border-gray-700 bg-gray-800 px-4 py-2">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-sm text-gray-300">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm text-green-400">{children}</div>
    </div>
  )
}

// Main Component
export default function FunkyHomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin">
          <Brain className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
      <ParticleSystem />
      <NeuralNetwork />
      <MatrixRain />
      <FloatingShapes />

      {/* Cursor Light Effect */}
      <div
        className="bg-gradient-radial pointer-events-none fixed z-10 h-96 w-96 rounded-full from-blue-500/10 via-purple-500/5 to-transparent mix-blend-screen"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            {/* Main Heading */}
            <div className="mb-8">
              <GlitchText className="mb-4 text-6xl font-bold tracking-tight md:text-8xl">
                <span className="animate-pulse bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  NEGENTROPER v1.0
                </span>
              </GlitchText>

              <div className="mb-6 font-mono text-2xl text-green-400 md:text-4xl">
                <span className="inline-block animate-bounce">&gt;</span>
                <span className="animate-type">_AI.DRIVEN.CMS.EXECUTE()</span>
                <span className="animate-blink">|</span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-3xl text-xl font-light text-gray-300 md:text-2xl">
              Where{' '}
              <span className="font-semibold text-cyan-400">
                artificial intelligence
              </span>{' '}
              meets
              <span className="font-semibold text-purple-400">
                {' '}
                creative chaos
              </span>{' '}
              in a symphony of
              <span className="font-semibold text-pink-400">
                {' '}
                digital innovation
              </span>
            </p>

            {/* Action Buttons */}
            <div className="mb-20 flex flex-wrap items-center justify-center gap-6">
              <Button
                asChild
                size="lg"
                className="transform border-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:scale-110 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/50"
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5" />
                  <span>HACK THE MATRIX</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="transform border-2 border-purple-500 text-purple-400 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-purple-500 hover:text-white hover:shadow-purple-500/50"
                asChild
              >
                <Link href="/writings" className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>NEURAL WRITINGS</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="transform border-2 border-pink-500 text-pink-400 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-pink-500 hover:text-white hover:shadow-pink-500/50"
                asChild
              >
                <Link href="/projects" className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5" />
                  <span>QUANTUM PROJECTS</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
              <GlitchText>
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  SYSTEM.CAPABILITIES()
                </span>
              </GlitchText>
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* AI Power Terminal */}
              <TerminalWindow title="neural_core.exe">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    <span>$ initialize_ai_core --model=gpt4</span>
                  </div>
                  <div className="text-cyan-400">
                    ✓ Neural networks: ONLINE
                    <br />
                    ✓ Creative algorithms: ACTIVE
                    <br />✓ Content generation: READY
                  </div>
                  <div className="text-gray-500">
                    &gt; Generating infinite possibilities...
                  </div>
                </div>
              </TerminalWindow>

              {/* Modern Stack Terminal */}
              <TerminalWindow title="tech_stack.sh">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span>$ cat system_specs.json</span>
                  </div>
                  <div className="text-purple-400">
                    {'{'}
                    <br />
                    &nbsp;&nbsp;"framework": "Next.js 14",
                    <br />
                    &nbsp;&nbsp;"runtime": "React 18",
                    <br />
                    &nbsp;&nbsp;"styling": "Tailwind CSS",
                    <br />
                    &nbsp;&nbsp;"database": "PostgreSQL"
                    <br />
                    {'}'}
                  </div>
                </div>
              </TerminalWindow>

              {/* Performance Terminal */}
              <TerminalWindow title="performance.monitor">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>$ htop --sort-by=PERFORMANCE</span>
                  </div>
                  <div className="text-yellow-400">
                    CPU: ████████████ 99.9%
                    <br />
                    RAM: ██████████░░ 85.2%
                    <br />
                    SPEED: ████████████ LUDICROUS
                  </div>
                  <div className="animate-pulse text-green-400">
                    ⚡ OPTIMIZED FOR WARP SPEED
                  </div>
                </div>
              </TerminalWindow>

              {/* Database Terminal */}
              <TerminalWindow title="database.sql">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-400" />
                    <span>$ SELECT * FROM capabilities;</span>
                  </div>
                  <div className="text-blue-400">
                    | scalability | INFINITE |<br />
                    | reliability | 99.99% |<br />| awesomeness | OVER_9000 |
                  </div>
                </div>
              </TerminalWindow>

              {/* Markdown Sync Terminal */}
              <TerminalWindow title="sync_engine.py">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    <span>$ python sync_markdown.py --watch</span>
                  </div>
                  <div className="text-pink-400">
                    Watching: Obsidian, Notion, Roam
                    <br />
                    Status: SYNCHRONIZED
                    <br />
                    Last sync: 0.001ms ago
                  </div>
                  <div className="text-green-400">
                    → Real-time markdown magic ✨
                  </div>
                </div>
              </TerminalWindow>

              {/* Architecture Terminal */}
              <TerminalWindow title="microservices.k8s">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-indigo-400" />
                    <span>$ kubectl get pods --all-namespaces</span>
                  </div>
                  <div className="text-indigo-400">
                    auth-service RUNNING ✓<br />
                    content-api RUNNING ✓<br />
                    ai-processor RUNNING ✓
                  </div>
                  <div className="text-green-400">All systems nominal 🚀</div>
                </div>
              </TerminalWindow>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20 p-12 backdrop-blur-sm">
              <h3 className="mb-6 text-3xl font-bold md:text-4xl">
                <GlitchText>
                  <span className="text-white">READY TO</span>{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    TRANSCEND
                  </span>{' '}
                  <span className="text-white">REALITY?</span>
                </GlitchText>
              </h3>

              <p className="mb-8 text-xl text-gray-300">
                Join the digital revolution where AI meets creativity in an
                explosion of pure innovation
              </p>

              <Button
                size="lg"
                className="transform border-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-8 py-4 text-lg text-white shadow-2xl shadow-orange-500/25 transition-all duration-300 hover:scale-110 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600"
                asChild
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <span>ENTER THE VOID</span>
                  <div className="h-6 w-6 animate-ping rounded-full bg-white"></div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Brain, Cpu, Zap, Code, Database, Sparkles, Terminal, Rocket } from 'lucide-react'
import { ParticleSystem } from '@/components/ui/particles'

// Neural Network Background Component
const NeuralNetwork = () => {
  const [nodes, setNodes] = useState<Array<{x: number, y: number, id: number}>>([])
  
  useEffect(() => {
    const generateNodes = () => {
      const newNodes = Array.from({ length: 25 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        id: i
      }))
      setNodes(newNodes)
    }
    generateNodes()
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Neural connections */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((targetNode, j) => {
            const distance = Math.sqrt(
              Math.pow(node.x - targetNode.x, 2) + Math.pow(node.y - targetNode.y, 2)
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
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
  const [drops, setDrops] = useState<Array<{id: number, x: number, delay: number}>>([])
  
  useEffect(() => {
    const newDrops = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (i * 6.67) + Math.random() * 3,
      delay: Math.random() * 2
    }))
    setDrops(newDrops)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute text-green-400 text-xs font-mono"
          style={{ 
            left: `${drop.x}%`,
            animationDelay: `${drop.delay}s`
          }}
        >
          <div className="animate-bounce-slow">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="opacity-80" style={{ animationDelay: `${i * 0.1}s` }}>
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
const GlitchText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 w-full text-red-500 opacity-70 animate-glitch-1"
        aria-hidden="true"
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 w-full text-blue-500 opacity-70 animate-glitch-2"
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className={`absolute animate-float opacity-20 ${
            i % 2 === 0 ? 'animate-spin-slow' : 'animate-reverse-spin'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `scale(${0.5 + Math.random() * 1.5})`
          }}
        >
          {i % 4 === 0 && (
            <div className="w-8 h-8 border-2 border-blue-400 transform rotate-45"></div>
          )}
          {i % 4 === 1 && (
            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          )}
          {i % 4 === 2 && (
            <div className="w-10 h-2 bg-gradient-to-r from-green-400 to-blue-400"></div>
          )}
          {i % 4 === 3 && (
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
          )}
        </div>
      ))}
    </div>
  )
}

// Terminal Window Component
const TerminalWindow = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden transform hover:scale-105 transition-all duration-300">
      <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-300 text-sm ml-2">{title}</span>
      </div>
      <div className="p-4 text-green-400 font-mono text-sm">
        {children}
      </div>
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin">
          <Brain className="w-8 h-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
      <ParticleSystem />
      <NeuralNetwork />
      <MatrixRain />
      <FloatingShapes />
      
      {/* Cursor Light Effect */}
      <div 
        className="fixed w-96 h-96 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full pointer-events-none z-10 mix-blend-screen"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Main Heading */}
            <div className="mb-8">
              <GlitchText className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  NEGENTROPER
                </span>
              </GlitchText>
              
              <div className="text-2xl md:text-4xl font-mono text-green-400 mb-6">
                <span className="inline-block animate-bounce">&gt;</span>
                <span className="animate-type">_AI.DRIVEN.CMS.EXECUTE()</span>
                <span className="animate-blink">|</span>
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light">
              Where <span className="text-cyan-400 font-semibold">artificial intelligence</span> meets 
              <span className="text-purple-400 font-semibold"> creative chaos</span> in a symphony of 
              <span className="text-pink-400 font-semibold"> digital innovation</span>
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-6 justify-center items-center mb-20">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-2xl shadow-cyan-500/25 transform hover:scale-110 transition-all duration-300 hover:shadow-cyan-500/50"
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5" />
                  <span>HACK THE MATRIX</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50 shadow-xl"
                asChild
              >
                <Link href="/writings" className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>NEURAL WRITINGS</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white transform hover:scale-110 transition-all duration-300 hover:shadow-pink-500/50 shadow-xl"
                asChild
              >
                <Link href="/projects" className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>QUANTUM PROJECTS</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <GlitchText>
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  SYSTEM.CAPABILITIES()
                </span>
              </GlitchText>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* AI Power Terminal */}
              <TerminalWindow title="neural_core.exe">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>$ initialize_ai_core --model=gpt4</span>
                  </div>
                  <div className="text-cyan-400">
                    ✓ Neural networks: ONLINE<br/>
                    ✓ Creative algorithms: ACTIVE<br/>
                    ✓ Content generation: READY
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
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>$ cat system_specs.json</span>
                  </div>
                  <div className="text-purple-400">
                    {"{"}<br/>
                    &nbsp;&nbsp;"framework": "Next.js 14",<br/>
                    &nbsp;&nbsp;"runtime": "React 18",<br/>
                    &nbsp;&nbsp;"styling": "Tailwind CSS",<br/>
                    &nbsp;&nbsp;"database": "PostgreSQL"<br/>
                    {"}"}
                  </div>
                </div>
              </TerminalWindow>

              {/* Performance Terminal */}
              <TerminalWindow title="performance.monitor">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>$ htop --sort-by=PERFORMANCE</span>
                  </div>
                  <div className="text-yellow-400">
                    CPU: ████████████ 99.9%<br/>
                    RAM: ██████████░░ 85.2%<br/>
                    SPEED: ████████████ LUDICROUS
                  </div>
                  <div className="text-green-400 animate-pulse">
                    ⚡ OPTIMIZED FOR WARP SPEED
                  </div>
                </div>
              </TerminalWindow>

              {/* Database Terminal */}
              <TerminalWindow title="database.sql">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>$ SELECT * FROM capabilities;</span>
                  </div>
                  <div className="text-blue-400">
                    | scalability    | INFINITE   |<br/>
                    | reliability    | 99.99%     |<br/>
                    | awesomeness    | OVER_9000  |
                  </div>
                </div>
              </TerminalWindow>

              {/* Markdown Sync Terminal */}
              <TerminalWindow title="sync_engine.py">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>$ python sync_markdown.py --watch</span>
                  </div>
                  <div className="text-pink-400">
                    Watching: Obsidian, Notion, Roam<br/>
                    Status: SYNCHRONIZED<br/>
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
                    <Code className="w-4 h-4 text-indigo-400" />
                    <span>$ kubectl get pods --all-namespaces</span>
                  </div>
                  <div className="text-indigo-400">
                    auth-service    RUNNING   ✓<br/>
                    content-api     RUNNING   ✓<br/>
                    ai-processor    RUNNING   ✓
                  </div>
                  <div className="text-green-400">
                    All systems nominal 🚀
                  </div>
                </div>
              </TerminalWindow>

            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20 backdrop-blur-sm border border-gray-800 rounded-2xl p-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                <GlitchText>
                  <span className="text-white">READY TO</span>{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    TRANSCEND
                  </span>{' '}
                  <span className="text-white">REALITY?</span>
                </GlitchText>
              </h3>
              
              <p className="text-xl text-gray-300 mb-8">
                Join the digital revolution where AI meets creativity in an explosion of pure innovation
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white border-0 shadow-2xl shadow-orange-500/25 transform hover:scale-110 transition-all duration-300 text-lg px-8 py-4"
                asChild
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <span>ENTER THE VOID</span>
                  <div className="w-6 h-6 bg-white rounded-full animate-ping"></div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
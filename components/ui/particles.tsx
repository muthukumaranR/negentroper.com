'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = (x: number, y: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: Math.random() * 120 + 60,
      size: Math.random() * 3 + 1,
      color: ['#60a5fa', '#8b5cf6', '#06ffa5', '#ff006e'][Math.floor(Math.random() * 4)]
    })

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life++

      // Gravity and decay
      particle.vy += 0.02
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Mouse attraction
      const dx = mouseRef.current.x - particle.x
      const dy = mouseRef.current.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100) {
        const force = (100 - distance) / 100 * 0.1
        particle.vx += (dx / distance) * force
        particle.vy += (dy / distance) * force
      }
    }

    const drawParticle = (particle: Particle) => {
      const alpha = 1 - (particle.life / particle.maxLife)
      ctx.globalAlpha = alpha * 0.8
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()

      // Add glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = particle.color
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Add new particles occasionally
      if (Math.random() < 0.3) {
        particlesRef.current.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        )
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        updateParticle(particle)
        drawParticle(particle)
        return particle.life < particle.maxLife
      })

      // Keep particle count reasonable
      if (particlesRef.current.length > 150) {
        particlesRef.current = particlesRef.current.slice(-100)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      
      // Add burst of particles on mouse movement
      if (Math.random() < 0.7) {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(
            createParticle(
              e.clientX + (Math.random() - 0.5) * 20,
              e.clientY + (Math.random() - 0.5) * 20
            )
          )
        }
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthData {
  status: string
  timestamp: string
  version: string
  environment: string
  uptime: number
  memory: {
    used: number
    total: number
    external: number
    rss: number
  }
  database: {
    status: string
    error?: string
  }
  environment_check: {
    all_required_vars_present: boolean
  }
}

export default function AdminHealthPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()

      if (response.ok) {
        setHealthData(data)
        setError(null)
      } else {
        setError(data.error || 'Health check failed')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health data'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading && !healthData) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">System Health</h1>
        <div className="py-8 text-center">Loading health data...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health</h1>
        <button
          onClick={fetchHealthData}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Health Check Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {healthData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-semibold ${
                  healthData.status === 'healthy'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {healthData.status.toUpperCase()}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Last checked: {new Date(healthData.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Version:</span>{' '}
                  {healthData.version}
                </div>
                <div>
                  <span className="font-medium">Environment:</span>{' '}
                  {healthData.environment}
                </div>
                <div>
                  <span className="font-medium">Uptime:</span>{' '}
                  {formatUptime(healthData.uptime)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Heap Used:</span>{' '}
                  {formatBytes(healthData.memory.used)}
                </div>
                <div>
                  <span className="font-medium">Heap Total:</span>{' '}
                  {formatBytes(healthData.memory.total)}
                </div>
                <div>
                  <span className="font-medium">RSS:</span>{' '}
                  {formatBytes(healthData.memory.rss)}
                </div>
                <div>
                  <span className="font-medium">External:</span>{' '}
                  {formatBytes(healthData.memory.external)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-semibold ${
                  healthData.database.status === 'connected'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {healthData.database.status.toUpperCase()}
              </div>
              {healthData.database.error && (
                <p className="mt-2 text-sm text-red-600">
                  {healthData.database.error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-semibold ${
                  healthData.environment_check.all_required_vars_present
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {healthData.environment_check.all_required_vars_present
                  ? 'ALL PRESENT'
                  : 'MISSING VARS'}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Required environment variables status
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

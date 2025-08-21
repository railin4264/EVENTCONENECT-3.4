'use client'

import { useEffect, useState } from 'react'

export default function StatusPage() {
  const [status, setStatus] = useState<{ ok: boolean; data?: any; error?: string }>({ ok: false })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${base}/health`, { cache: 'no-store' })
        const data = await res.json()
        setStatus({ ok: res.ok, data })
      } catch (e: any) {
        setStatus({ ok: false, error: e?.message || 'Error' })
      }
    }
    fetchStatus()
  }, [])

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Estado del Sistema</h1>
      {!status.data && !status.error && (
        <div className="animate-pulse">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      )}
      {status.error && (
        <div className="text-red-600">{status.error}</div>
      )}
      {status.data && (
        <div className="grid gap-4">
          <div>
            <span className="font-medium">API:</span>{' '}
            <span className={status.ok ? 'text-green-600' : 'text-red-600'}>
              {status.ok ? 'OK' : 'ERROR'}
            </span>
          </div>
          <div><span className="font-medium">Entorno:</span> {status.data.environment}</div>
          <div><span className="font-medium">Base de datos:</span> {status.data.database}</div>
          <div><span className="font-medium">Redis:</span> {status.data.redis}</div>
          <div><span className="font-medium">Uptime:</span> {status.data.uptime}s</div>
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">{JSON.stringify(status.data, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}


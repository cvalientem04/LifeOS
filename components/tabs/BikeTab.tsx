'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDayStore } from '@/lib/dayStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { speedToColor, uid } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { BikeRoute, RouteCoord } from '@/lib/types'

// Leaflet must be client-only
const GPSMap = dynamic(() => import('@/components/bike/GPSMap'), { ssr: false, loading: () => (
  <div className="h-[350px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
    <span className="text-sm text-slate-500">Cargando mapa...</span>
  </div>
) })

export function BikeTab() {
  const { currentDate } = useAppStore()
  const dayStore = useDayStore()
  const day = dayStore.getDay(currentDate)

  // Steps
  const [manualSteps, setManualSteps] = useState('')

  // GPS state
  const [tracking, setTracking] = useState(false)
  const [coords, setCoords] = useState<RouteCoord[]>([])
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [liveDist, setLiveDist] = useState(0)
  const [liveAvg, setLiveAvg] = useState(0)
  const [liveElapsed, setLiveElapsed] = useState(0)
  const [gpsStatus, setGpsStatus] = useState('GPS en espera')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)

  const watchId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  function haversineKm(a: RouteCoord, b: RouteCoord) {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.asin(Math.sqrt(h))
  }

  function startGPS() {
    if (!navigator.geolocation) return
    setTracking(true)
    setCoords([])
    setLiveSpeed(0)
    setLiveDist(0)
    setLiveElapsed(0)
    startTime.current = Date.now()
    setGpsStatus('🟢 GPS activo')

    tickRef.current = setInterval(() => {
      if (startTime.current) setLiveElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed, accuracy } = pos.coords
        setGpsStatus(`🟢 GPS activo (±${Math.round(accuracy)}m)`)
        let kmh = speed && speed >= 0 ? speed * 3.6 : 0

        setCoords((prev) => {
          if (prev.length > 0 && (!speed || speed < 0)) {
            const last = prev[prev.length - 1]
            const dtSec = Math.max(1, (Date.now() - last.ts) / 1000)
            const dKm = haversineKm(last, { lat, lng, speedKmh: 0, ts: Date.now() })
            kmh = (dKm / (dtSec / 3600))
          }
          kmh = Math.min(65, Math.max(0, kmh))

          const newCoord: RouteCoord = { lat, lng, speedKmh: Math.round(kmh * 10) / 10, ts: Date.now() }
          const updated = [...prev, newCoord]
          if (prev.length > 0) {
            const seg = haversineKm(prev[prev.length - 1], newCoord)
            setLiveDist((d) => {
              const nd = d + seg
              const elapsed = (Date.now() - (startTime.current ?? Date.now())) / 3_600_000
              setLiveAvg(elapsed > 0 ? Math.round((nd / elapsed) * 10) / 10 : 0)
              return nd
            })
          }
          setLiveSpeed(Math.round(kmh * 10) / 10)
          return updated
        })
      },
      (err) => setGpsStatus(`⚠️ ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
  }

  function stopGPS() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    if (tickRef.current) clearInterval(tickRef.current)
    setTracking(false)
    setGpsStatus('GPS en espera')

    if (coords.length < 2) return
    const route: BikeRoute = {
      id: uid(),
      date: currentDate,
      startedAt: new Date(coords[0].ts).toISOString(),
      finishedAt: new Date(coords[coords.length - 1].ts).toISOString(),
      durationMin: Math.round(liveElapsed / 60),
      distanceKm: Math.round(liveDist * 100) / 100,
      avgSpeedKmh: liveAvg,
      maxSpeedKmh: Math.max(...coords.map((c) => c.speedKmh)),
      coords,
    }
    dayStore.saveRoute(currentDate, route)
    setCoords([])
  }

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Replay route
  const replayCoords = selectedRouteId
    ? day.bikeRoutes.find((r) => r.id === selectedRouteId)?.coords ?? []
    : coords

  return (
    <div className="space-y-4">
      {/* Steps */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-orange-400">⌚ Pasos del Día</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-white">{day.steps.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/ 10.000 pasos</span>
            </div>
            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                style={{ width: `${Math.min((day.steps / 10000) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1000, 2000, 5000].map((n) => (
              <button key={n}
                onClick={() => dayStore.addSteps(currentDate, n)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-300">
                +{n >= 1000 ? `${n / 1000}k` : n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          <input
            type="number"
            value={manualSteps}
            onChange={(e) => setManualSteps(e.target.value)}
            placeholder="Introducir pasos exactos de tu reloj..."
            className="flex-1 studio-input rounded-xl px-3 py-1.5 text-xs font-mono"
          />
          <button
            onClick={() => {
              if (!manualSteps) return
              dayStore.setSteps(currentDate, parseInt(manualSteps))
              setManualSteps('')
            }}
            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-extrabold transition-all">
            Guardar
          </button>
        </div>
      </StudioCard>

      {/* GPS */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">🚴 Ciclocomputador GPS Real</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">{gpsStatus}</span>
            </div>
            <p className="text-[11px] text-slate-400">Pinta tu velocidad real en el mapa por colores de tramo</p>
          </div>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Velocidad', val: `${liveSpeed.toFixed(1)}`, unit: 'km/h', color: 'text-cyan-400' },
            { label: 'Distancia', val: liveDist.toFixed(2), unit: 'km', color: 'text-white' },
            { label: 'Tiempo', val: formatElapsed(liveElapsed), unit: 'min', color: 'text-amber-400' },
            { label: 'Vel. Media', val: liveAvg.toFixed(1), unit: 'km/h', color: 'text-emerald-400' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">{m.label}</span>
              <span className={`text-lg font-extrabold font-mono ${m.color}`}>{m.val}</span>
              <span className="text-[9px] text-slate-500 block">{m.unit}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!tracking ? (
            <button onClick={startGPS}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all">
              📍 Iniciar Ruta GPS Real
            </button>
          ) : (
            <button onClick={stopGPS}
              className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-lg transition-all">
              ⏹ Finalizar y Guardar Ruta
            </button>
          )}
        </div>

        {/* Map */}
        <GPSMap coords={replayCoords} />

        {/* Speed legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-400 px-1">
          <span>Velocidad:</span>
          <span className="text-blue-400">🔵 &lt;12 km/h</span>
          <span className="text-emerald-400">🟢 12-22</span>
          <span className="text-amber-400">🟠 22-30</span>
          <span className="text-rose-400">🔴 &gt;30</span>
        </div>

        {/* Route history */}
        {day.bikeRoutes.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-300">🗺️ Rutas Guardadas (toca para ver en mapa)</h4>
            {day.bikeRoutes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(selectedRouteId === r.id ? null : r.id)}
                className={cn(
                  'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all text-left',
                  selectedRouteId === r.id
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 text-slate-300 hover:border-slate-700'
                )}
              >
                <span className="font-bold">🚴 {r.distanceKm.toFixed(2)} km</span>
                <span className="text-slate-500">{r.durationMin} min · ⌀ {r.avgSpeedKmh.toFixed(1)} km/h</span>
              </button>
            ))}
          </div>
        )}
      </StudioCard>
    </div>
  )
}

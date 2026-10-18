'use client'

import { useEffect, useRef } from 'react'
import type { RouteCoord } from '@/lib/types'
import { speedToColor } from '@/lib/utils'

interface Props {
  coords: RouteCoord[]
  onCenterMe?: () => void
}

export default function GPSMap({ coords }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const pathLayerGroupRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const centerOnUser = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        mapInstanceRef.current.setView([lat, lng], 16)
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        }
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [39.5696, 2.6502], // Default view
        zoom: 14,
        zoomControl: true,
      })

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri',
        maxZoom: 19,
      }).addTo(map)

      pathLayerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map

      // Crucial: Leaflet needs invalidateSize once container is rendered in DOM
      setTimeout(() => {
        map.invalidateSize()
      }, 250)

      // Geolocation prompt & center
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const latlng = [pos.coords.latitude, pos.coords.longitude] as [number, number]
            map.setView(latlng, 16)
            const gpsDot = L.divIcon({
              className: '',
              html: '<div class="gps-dot"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })
            markerRef.current = L.marker(latlng, { icon: gpsDot }).addTo(map)
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 }
        )
      }
    })

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Invalidate size on resize
  useEffect(() => {
    if (!mapRef.current) return
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })
    ro.observe(mapRef.current)
    return () => ro.disconnect()
  }, [])

  // Update polylines when coords change
  useEffect(() => {
    if (!mapInstanceRef.current || !pathLayerGroupRef.current) return

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current
      const layerGroup = pathLayerGroupRef.current

      layerGroup.clearLayers()

      if (coords.length >= 2) {
        for (let i = 1; i < coords.length; i++) {
          const a = coords[i - 1]
          const b = coords[i]
          const color = speedToColor((a.speedKmh + b.speedKmh) / 2)
          L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
            color,
            weight: 5,
            opacity: 0.95,
          }).addTo(layerGroup)
        }
      }

      if (coords.length > 0) {
        const last = coords[coords.length - 1]
        if (markerRef.current) {
          markerRef.current.setLatLng([last.lat, last.lng])
        } else {
          const gpsDot = L.divIcon({
            className: '',
            html: '<div class="gps-dot"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })
          markerRef.current = L.marker([last.lat, last.lng], { icon: gpsDot }).addTo(map)
        }
        map.panTo([last.lat, last.lng])
      }
    })
  }, [coords])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
      <div
        ref={mapRef}
        className="w-full h-[360px] bg-slate-900"
      />
      <button
        type="button"
        onClick={centerOnUser}
        title="Centrar mi ubicación"
        className="absolute top-3 right-3 z-[400] bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 p-2.5 rounded-xl shadow-lg backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all"
      >
        <span>🎯</span>
        <span>Mi Ubicación</span>
      </button>
    </div>
  )
}

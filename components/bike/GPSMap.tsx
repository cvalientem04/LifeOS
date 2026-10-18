'use client'

import { useEffect, useRef } from 'react'
import type { RouteCoord } from '@/lib/types'
import { speedToColor } from '@/lib/utils'

interface Props {
  coords: RouteCoord[]
}

export default function GPSMap({ coords }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstanceRef.current) return  // already initialized

    // Dynamic import of Leaflet
    import('leaflet').then((L) => {
      // Fix Leaflet default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [40.4168, -3.7038],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      // Try to center on user
      navigator.geolocation?.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15)
      })
    })
  }, [])

  // Update polyline when coords change
  useEffect(() => {
    if (!mapInstanceRef.current || coords.length < 2) return

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current

      // Draw colored segments
      for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1]
        const b = coords[i]
        const color = speedToColor((a.speedKmh + b.speedKmh) / 2)
        L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
          color,
          weight: 4,
          opacity: 0.9,
        }).addTo(map)
      }

      // Live marker
      const last = coords[coords.length - 1]
      if (markerRef.current) {
        markerRef.current.setLatLng([last.lat, last.lng])
      } else {
        const gpsDot = L.divIcon({
          className: '',
          html: '<div class="gps-dot"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        markerRef.current = L.marker([last.lat, last.lng], { icon: gpsDot }).addTo(map)
      }

      map.panTo([last.lat, last.lng])
    })
  }, [coords])

  return (
    <div
      ref={mapRef}
      style={{ height: 350, width: '100%', borderRadius: '1rem', zIndex: 10, border: '1px solid rgba(255,255,255,0.12)' }}
    />
  )
}

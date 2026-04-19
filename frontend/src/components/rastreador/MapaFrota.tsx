import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FulltrackPosicao } from '../../types'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const arrCentroBrasil: [number, number] = [-14.235, -51.9253]

function fnNormalizarPlaca(strPlaca: string): string {
  return strPlaca.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

function AjustarLimites({
  arrCentros,
  bolMiniMapa,
}: {
  arrCentros: [number, number][]
  bolMiniMapa: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (arrCentros.length === 0) {
      map.setView(arrCentroBrasil, 4)
      return
    }
    const bounds = L.latLngBounds(arrCentros)
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: bolMiniMapa ? 13 : 15 })
  }, [arrCentros, map, bolMiniMapa])
  return null
}

function FocoPlaca({
  strPlacaFoco,
  arrPosicoes,
}: {
  strPlacaFoco: string | null
  arrPosicoes: FulltrackPosicao[]
}) {
  const map = useMap()
  useEffect(() => {
    if (!strPlacaFoco) return
    const strNorm = fnNormalizarPlaca(strPlacaFoco)
    const objP = arrPosicoes.find((p) => fnNormalizarPlaca(p.ras_vei_placa) === strNorm)
    if (!objP) return
    const numLat = parseFloat(objP.ras_eve_latitude)
    const numLng = parseFloat(objP.ras_eve_longitude)
    if (Number.isNaN(numLat) || Number.isNaN(numLng)) return
    map.flyTo([numLat, numLng], 16)
  }, [strPlacaFoco, arrPosicoes, map])
  return null
}

type MapaFrotaProps = {
  arrPosicoes: FulltrackPosicao[]
  arrTrajeto?: [number, number][]
  numAltura?: number
  bolMiniMapa?: boolean
  strPlacaFoco?: string | null
}

export default function MapaFrota({
  arrPosicoes,
  arrTrajeto,
  numAltura = 400,
  bolMiniMapa = false,
  strPlacaFoco = null,
}: MapaFrotaProps) {
  const arrCentros = useMemo(() => {
    const arr: [number, number][] = []
    for (const p of arrPosicoes) {
      const lat = parseFloat(p.ras_eve_latitude)
      const lng = parseFloat(p.ras_eve_longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        arr.push([lat, lng])
      }
    }
    return arr
  }, [arrPosicoes])

  const strCentro = arrCentros[0] ?? arrCentroBrasil
  const numZoomInicial = arrCentros.length === 0 ? 4 : 12

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200 z-0"
      style={{ height: numAltura, minHeight: bolMiniMapa ? 200 : 280 }}
    >
      <MapContainer
        center={strCentro}
        zoom={numZoomInicial}
        className="h-full w-full"
        scrollWheelZoom={!bolMiniMapa}
        attributionControl={!bolMiniMapa}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarLimites arrCentros={arrCentros} bolMiniMapa={bolMiniMapa} />
        <FocoPlaca strPlacaFoco={strPlacaFoco ?? null} arrPosicoes={arrPosicoes} />
        {arrTrajeto && arrTrajeto.length > 1 && (
          <Polyline positions={arrTrajeto} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85 }} />
        )}
        {arrPosicoes.map((p, numIdx) => {
          const lat = parseFloat(p.ras_eve_latitude)
          const lng = parseFloat(p.ras_eve_longitude)
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null
          const bolIgnicao = p.ras_eve_ignicao === '1'
          const numRaio = bolMiniMapa ? 5 : 8
          return (
            <CircleMarker
              key={`m-${numIdx}-${p.ras_vei_id}`}
              center={[lat, lng]}
              radius={numRaio}
              pathOptions={{
                color: bolIgnicao ? '#15803d' : '#6b7280',
                fillColor: bolIgnicao ? '#22c55e' : '#d1d5db',
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm min-w-[160px]">
                  <p className="font-semibold">{p.ras_vei_placa}</p>
                  <p className="text-gray-600">{p.ras_vei_veiculo}</p>
                  <p className="text-xs mt-1">
                    {p.ras_eve_data_gps} &middot; {p.ras_eve_velocidade ?? '0'} km/h
                  </p>
                  <p className="text-xs">Ignição: {bolIgnicao ? 'ligada' : 'desligada'}</p>
                  <p className="text-xs">Bateria: {p.ras_eve_voltagem ?? '-'} V</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

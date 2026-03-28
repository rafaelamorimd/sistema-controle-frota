import { useState } from 'react'
import logoUrl from '../../assets/logo01.png'

const strBase = import.meta.env.BASE_URL ?? '/'
const strLogoSvgFallback = strBase.endsWith('/') ? `${strBase}logo-gefther.svg` : `${strBase}/logo-gefther.svg`

type BrandLogoProps = {
  variant?: 'login' | 'sidebar' | 'header'
  className?: string
}

export default function BrandLogo({ variant = 'login', className = '' }: BrandLogoProps) {
  const [bolUsarSvg, setBolUsarSvg] = useState(false)

  const strSize =
    variant === 'login'
      ? 'max-h-36 w-auto max-w-[280px] mx-auto'
      : variant === 'sidebar'
        ? 'max-h-24 w-auto max-w-full'
        : 'h-9 w-auto max-h-9'

  const strSrc = bolUsarSvg ? strLogoSvgFallback : logoUrl

  return (
    <img
      src={strSrc}
      alt="GEFTHER - Gestao Inteligente de Frotas"
      className={`object-contain ${strSize} ${className}`.trim()}
      decoding="async"
      onError={() => {
        if (!bolUsarSvg) setBolUsarSvg(true)
      }}
    />
  )
}

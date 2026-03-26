const strLogoUrl = '/logo01.png'

type BrandLogoProps = {
  variant?: 'login' | 'sidebar' | 'header'
  className?: string
}

export default function BrandLogo({ variant = 'login', className = '' }: BrandLogoProps) {
  const strSize =
    variant === 'login'
      ? 'max-h-36 w-auto max-w-[280px] mx-auto'
      : variant === 'sidebar'
        ? 'max-h-24 w-auto max-w-full'
        : 'h-9 w-auto max-h-9'

  return (
    <img
      src={strLogoUrl}
      alt="GEFTHER - Gestao Inteligente de Frotas"
      className={`object-contain ${strSize} ${className}`.trim()}
      decoding="async"
    />
  )
}

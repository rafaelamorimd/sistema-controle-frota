const strLogoUrl = '/logo01.png'

type BrandLogoProps = {
  variant?: 'login' | 'sidebar' | 'header'
  className?: string
}

export default function BrandLogo({ variant = 'login', className = '' }: BrandLogoProps) {
  const strSize =
    variant === 'login'
      ? 'max-h-36 w-auto max-w-[260px] mx-auto'
      : variant === 'sidebar'
        ? 'max-h-24 w-auto max-w-full'
        : 'h-8 w-auto max-h-8'

  const objImg = (
    <img
      src={strLogoUrl}
      alt="GEFTHER - Gestao Inteligente de Frotas"
      className={`object-contain object-center ${strSize} ${className}`.trim()}
      decoding="async"
    />
  )

  if (variant === 'header') {
    return (
      <span className="inline-flex items-center justify-center rounded-md px-1.5 py-1 ring-1">
        {objImg}
      </span>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className="rounded-lg p-2 ring-1 shadow-inner">
        {objImg}
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <div className="rounded-x  px-5 py-4 ring-1 w-full max-w-[280px]">
        {objImg}
      </div>
    </div>
  )
}

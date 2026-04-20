import { X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  titulo: string
  aberto: boolean
  aoFechar: () => void
  children: React.ReactNode
  strMaxWidthClass?: string
}

export default function Modal({
  titulo,
  aberto,
  aoFechar,
  children,
  strMaxWidthClass = 'max-w-lg',
}: ModalProps) {
  const strIdTitulo = useId()

  useEffect(() => {
    if (!aberto) return
    const strOverflowPrev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = strOverflowPrev
    }
  }, [aberto])

  if (!aberto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex min-h-full justify-center overflow-y-auto overscroll-contain p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={aoFechar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={strIdTitulo}
        className={`relative z-10 my-auto w-full ${strMaxWidthClass} max-h-[min(90dvh,calc(100dvh-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg`}
      >
        <div className="flex max-h-[min(90dvh,calc(100dvh-2rem))] flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
            <h3 id={strIdTitulo} className="font-display text-lg font-semibold tracking-tight text-gray-900">
              {titulo}
            </h3>
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

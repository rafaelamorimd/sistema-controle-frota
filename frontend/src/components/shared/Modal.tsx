import { X } from 'lucide-react'

type ModalProps = {
  titulo: string
  aberto: boolean
  aoFechar: () => void
  children: React.ReactNode
}

export default function Modal({ titulo, aberto, aoFechar, children }: ModalProps) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={aoFechar}
      />
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <button
            type="button"
            onClick={aoFechar}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

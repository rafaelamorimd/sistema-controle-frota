import type { ReactNode } from 'react'
import { useMediaQuery } from '../../utils/useMediaQuery'

export interface Column<T> {
  strLabel: string
  strKey: string
  render: (item: T) => ReactNode
  bolHideMobile?: boolean
}

interface ResponsiveTableProps<T> {
  arrColumns: Column<T>[]
  arrData: T[]
  fnKeyExtractor: (item: T) => string | number
  fnRenderActions?: (item: T) => ReactNode
  fnRenderCardHeader?: (item: T) => ReactNode
  strEmptyMessage?: string
  bolLoading?: boolean
}

export default function ResponsiveTable<T>({
  arrColumns,
  arrData,
  fnKeyExtractor,
  fnRenderActions,
  fnRenderCardHeader,
  strEmptyMessage = 'Nenhum registro encontrado.',
  bolLoading = false,
}: ResponsiveTableProps<T>) {
  const bolDesktop = useMediaQuery('(min-width: 768px)')

  if (bolLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando...</div>
  }

  if (arrData.length === 0) {
    return <div className="p-8 text-center text-gray-500">{strEmptyMessage}</div>
  }

  if (bolDesktop) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {arrColumns.map((col) => (
                <th
                  key={col.strKey}
                  className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase"
                >
                  {col.strLabel}
                </th>
              ))}
              {fnRenderActions && (
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {arrData.map((item) => (
              <tr key={fnKeyExtractor(item)} className="hover:bg-gray-50">
                {arrColumns.map((col) => (
                  <td key={col.strKey} className="px-6 py-4">
                    {col.render(item)}
                  </td>
                ))}
                {fnRenderActions && (
                  <td className="px-6 py-4 text-right">
                    {fnRenderActions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const arrMobileColumns = arrColumns.filter((col) => !col.bolHideMobile)

  return (
    <div className="divide-y divide-gray-100">
      {arrData.map((item) => (
        <div key={fnKeyExtractor(item)} className="p-4 space-y-3">
          {fnRenderCardHeader && (
            <div className="mb-1">{fnRenderCardHeader(item)}</div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {arrMobileColumns.map((col) => (
              <div key={col.strKey}>
                <span className="block text-xs font-semibold text-gray-400 uppercase">
                  {col.strLabel}
                </span>
                <span className="text-sm text-gray-800">{col.render(item)}</span>
              </div>
            ))}
          </div>
          {fnRenderActions && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
              {fnRenderActions(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

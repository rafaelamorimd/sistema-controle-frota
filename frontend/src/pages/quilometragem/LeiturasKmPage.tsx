import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import Modal from '../../components/shared/Modal'
import { condutorService } from '../../services/condutorService'
import { contratoService } from '../../services/contratoService'
import { leituraKmService } from '../../services/leituraKmService'
import { veiculoService } from '../../services/veiculoService'
import type { Contrato, LeituraKm } from '../../types'

type FormNovaLeitura = {
  km: string
  foto: File | null
  contrato_id: string
  condutor_id: string
  observacoes: string
}

const formVazio: FormNovaLeitura = {
  km: '',
  foto: null,
  contrato_id: '',
  condutor_id: '',
  observacoes: '',
}

export default function LeiturasKmPage() {
  const queryClient = useQueryClient()
  const [veiculoId, setVeiculoId] = useState<number | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormNovaLeitura>(formVazio)

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ per_page: 500 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['leituras-km', veiculoId],
    queryFn: () => leituraKmService.listarPorVeiculo(veiculoId!),
    enabled: veiculoId != null,
  })

  const { data: contratosData } = useQuery({
    queryKey: ['contratos', 'select'],
    queryFn: () => contratoService.listar({ per_page: 500 }),
  })

  const { data: condutoresData } = useQuery({
    queryKey: ['condutores', 'select'],
    queryFn: () => condutorService.listar({ per_page: 500 }),
  })

  const salvarMutation = useMutation({
    mutationFn: ({ vid, formData }: { vid: number; formData: FormData }) =>
      leituraKmService.criar(vid, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leituras-km', veiculoId] })
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      setModalAberto(false)
      setForm(formVazio)
    },
  })

  const leiturasBrutas = data?.data ?? []
  const veiculos = veiculosData?.data ?? []
  const contratos = contratosData?.data ?? []
  const condutores = condutoresData?.data ?? []

  const leiturasComCalculo = useMemo(() => {
    const asc = [...leiturasBrutas].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    const mapKmAnterior = new Map<number, number>()
    asc.forEach((l, i) => {
      if (i > 0) mapKmAnterior.set(l.id, asc[i - 1].km)
    })
    const desc = [...leiturasBrutas].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return desc.map((l) => {
      const kmAnterior = mapKmAnterior.get(l.id)
      const kmPercorrido =
        kmAnterior !== undefined ? l.km - kmAnterior : undefined
      return { ...l, km_anterior: kmAnterior, km_percorrido: kmPercorrido }
    })
  }, [leiturasBrutas])

  function abrirNovo() {
    setForm(formVazio)
    setModalAberto(true)
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (veiculoId == null || !form.foto) return
    const fd = new FormData()
    fd.append('km', String(parseInt(form.km, 10)))
    fd.append('foto', form.foto)
    if (form.contrato_id) fd.append('contrato_id', form.contrato_id)
    if (form.condutor_id) fd.append('condutor_id', form.condutor_id)
    if (form.observacoes.trim()) fd.append('observacoes', form.observacoes.trim())
    salvarMutation.mutate({ vid: veiculoId, formData: fd })
  }

  const dataExibicao = (l: LeituraKm) =>
    l.data_leitura ?? l.created_at

  const msgErro =
    salvarMutation.error && axios.isAxiosError(salvarMutation.error)
      ? String(
          (salvarMutation.error.response?.data as { message?: string })?.message ??
            salvarMutation.error.message,
        )
      : salvarMutation.error
        ? (salvarMutation.error as Error).message
        : null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leituras de quilometragem</h2>
        <button
          type="button"
          disabled={veiculoId == null}
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> Nova leitura
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
        <select
          value={veiculoId ?? ''}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : null
            setVeiculoId(v)
          }}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Selecione um veículo...</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.modelo}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {veiculoId == null ? (
          <div className="p-8 text-center text-gray-500">Selecione um veículo para ver as leituras.</div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : leiturasComCalculo.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma leitura para este veículo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Contrato
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Condutor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    KM
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Anterior
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Percorrido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leiturasComCalculo.map((l: LeituraKm) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(dataExibicao(l)).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {l.contrato ? l.contrato.numero_contrato : l.contrato_id ? `#${l.contrato_id}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {l.condutor?.nome ?? (l.condutor_id ? `#${l.condutor_id}` : '—')}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-900">
                      {l.km.toLocaleString('pt-BR')} km
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {l.km_anterior != null ? `${l.km_anterior.toLocaleString('pt-BR')} km` : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {l.km_percorrido != null ? `${l.km_percorrido.toLocaleString('pt-BR')} km` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        titulo="Nova leitura"
        aberto={modalAberto}
        aoFechar={() => {
          setModalAberto(false)
          setForm(formVazio)
        }}
      >
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem (km) *</label>
            <input
              type="number"
              required
              min={0}
              value={form.km}
              onChange={(e) => setForm((f) => ({ ...f, km: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto do hodômetro *</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              required
              onChange={(e) => setForm((f) => ({ ...f, foto: e.target.files?.[0] ?? null }))}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contrato (opcional)</label>
            <select
              value={form.contrato_id}
              onChange={(e) => setForm((f) => ({ ...f, contrato_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Nenhum</option>
              {(contratos as Contrato[]).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_contrato}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condutor (opcional)</label>
            <select
              value={form.condutor_id}
              onChange={(e) => setForm((f) => ({ ...f, condutor_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Nenhum</option>
              {condutores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {msgErro && <p className="text-sm text-red-600">{msgErro}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalAberto(false)
                setForm(formVazio)
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvarMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { leituraKmService } from '../../services/leituraKmService'
import { veiculoService } from '../../services/veiculoService'
import type { LeituraKm, Pagamento } from '../../types'

type FormNovaLeitura = {
  km: string
  foto: File | null
  strDataLeitura: string
  pagamento_id: string
  observacoes: string
}

const formVazio: FormNovaLeitura = {
  km: '',
  foto: null,
  strDataLeitura: new Date().toISOString().slice(0, 10),
  pagamento_id: '',
  observacoes: '',
}

type LeituraComCalculo = LeituraKm & {
  km_anterior?: number
  km_percorrido?: number
}

export default function LeiturasKmPage() {
  const queryClient = useQueryClient()
  const [veiculoId, setVeiculoId] = useState<number | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormNovaLeitura>(formVazio)
  const [strDataInicioFiltro, setStrDataInicioFiltro] = useState('')
  const [strDataFimFiltro, setStrDataFimFiltro] = useState('')

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['leituras-km', veiculoId, strDataInicioFiltro, strDataFimFiltro],
    queryFn: () =>
      leituraKmService.listarPorVeiculo(veiculoId!, {
        ...(strDataInicioFiltro ? { data_inicio: strDataInicioFiltro } : {}),
        ...(strDataFimFiltro ? { data_fim: strDataFimFiltro } : {}),
        por_pagina: 100,
      }),
    enabled: veiculoId != null,
  })

  const { data: pagamentosElegiveisData } = useQuery({
    queryKey: ['pagamentos-elegiveis-km', veiculoId],
    queryFn: () => leituraKmService.listarPagamentosElegiveis(veiculoId!, { por_pagina: 100 }),
    enabled: veiculoId != null && modalAberto,
  })

  const salvarMutation = useMutation({
    mutationFn: ({ vid, formData }: { vid: number; formData: FormData }) =>
      leituraKmService.criar(vid, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leituras-km', veiculoId] })
      queryClient.invalidateQueries({ queryKey: ['pagamentos-elegiveis-km', veiculoId] })
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] })
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      setModalAberto(false)
      setForm(formVazio)
    },
  })

  const leiturasBrutas = data?.data ?? []
  const veiculos = veiculosData?.data ?? []
  const pagamentosElegiveis = pagamentosElegiveisData?.data ?? []

  const leiturasComCalculo: LeituraComCalculo[] = useMemo(() => {
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
    if (veiculoId == null) return
    if (!form.pagamento_id) return
    const numKm = parseInt(form.km, 10)
    if (Number.isNaN(numKm)) return
    const fd = new FormData()
    fd.append('km', String(numKm))
    if (form.foto) fd.append('foto', form.foto)
    fd.append('data_leitura', form.strDataLeitura)
    fd.append('pagamento_id', form.pagamento_id)
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

  const arrColumns: Column<LeituraComCalculo>[] = [
    {
      strLabel: 'Data',
      strKey: 'data',
      render: (l) => (
        <span className="text-gray-700">
          {new Date(dataExibicao(l)).toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      strLabel: 'Ref. contrato',
      strKey: 'ref',
      render: (l) => (
        <span className="text-gray-600 text-sm">
          {l.data_referencia
            ? new Date(l.data_referencia).toLocaleDateString('pt-BR')
            : '\u2014'}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'Contrato',
      strKey: 'contrato',
      render: (l) => (
        <span className="text-gray-900">
          {l.contrato ? l.contrato.numero_contrato : l.contrato_id ? `#${l.contrato_id}` : '\u2014'}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'Condutor',
      strKey: 'condutor',
      render: (l) => (
        <span className="text-gray-700">
          {l.condutor?.nome ?? (l.condutor_id ? `#${l.condutor_id}` : '\u2014')}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'Pagamento',
      strKey: 'pagamento',
      render: (l) => (
        <span className="text-gray-600 text-sm">
          {l.pagamento_id != null
            ? `#${l.pagamento_id} (${l.pagamento?.data_referencia ? new Date(l.pagamento.data_referencia).toLocaleDateString('pt-BR') : ''})`
            : '\u2014'}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'KM',
      strKey: 'km',
      render: (l) => (
        <span className="font-mono text-gray-900">
          {l.km.toLocaleString('pt-BR')} km
        </span>
      ),
    },
    {
      strLabel: 'Anterior',
      strKey: 'anterior',
      render: (l) => (
        <span className="font-mono text-gray-600">
          {l.km_anterior != null ? `${l.km_anterior.toLocaleString('pt-BR')} km` : '\u2014'}
        </span>
      ),
    },
    {
      strLabel: 'Percorrido',
      strKey: 'percorrido',
      render: (l) => (
        <span className="font-mono text-gray-600">
          {l.km_percorrido != null ? `${l.km_percorrido.toLocaleString('pt-BR')} km` : '\u2014'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leituras de quilometragem</h2>
        <button
          type="button"
          disabled={veiculoId == null}
          onClick={abrirNovo}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> Nova leitura
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
          <select
            value={veiculoId ?? ''}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : null
              setVeiculoId(v)
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Selecione um veículo...</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.modelo}
              </option>
            ))}
          </select>
        </div>
        {veiculoId != null && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">De</label>
              <input
                type="date"
                value={strDataInicioFiltro}
                onChange={(e) => setStrDataInicioFiltro(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Até</label>
              <input
                type="date"
                value={strDataFimFiltro}
                onChange={(e) => setStrDataFimFiltro(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {veiculoId == null ? (
          <div className="p-8 text-center text-gray-500">Selecione um veículo para ver as leituras.</div>
        ) : (
          <ResponsiveTable
            arrColumns={arrColumns}
            arrData={leiturasComCalculo}
            fnKeyExtractor={(l) => l.id}
            bolLoading={isLoading}
            strEmptyMessage="Nenhuma leitura para este veículo."
            fnRenderCardHeader={(l) => (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {new Date(dataExibicao(l)).toLocaleDateString('pt-BR')}
                </span>
                <span className="font-mono font-bold text-brand-primary">
                  {l.km.toLocaleString('pt-BR')} km
                </span>
              </div>
            )}
          />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pagamento (pago, sem leitura) *
            </label>
            <select
              required
              value={form.pagamento_id}
              onChange={(e) => setForm((f) => ({ ...f, pagamento_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {(pagamentosElegiveis as Pagamento[]).map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — ref. {new Date(p.data_referencia).toLocaleDateString('pt-BR')} —{' '}
                  {p.condutor?.nome ?? `#${p.condutor_id}`}
                </option>
              ))}
            </select>
            {pagamentosElegiveis.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">
                Não há pagamentos pagos sem quilometragem vinculada para este veículo. Registre ou edite um pagamento
                informando a KM, ou aguarde novos pagamentos.
              </p>
            )}
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da leitura</label>
            <input
              type="date"
              value={form.strDataLeitura}
              onChange={(e) => setForm((f) => ({ ...f, strDataLeitura: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto do hodômetro (opcional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => setForm((f) => ({ ...f, foto: e.target.files?.[0] ?? null }))}
              className="w-full text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            Contrato e condutor vêm automaticamente do pagamento selecionado.
          </p>
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
              disabled={salvarMutation.isPending || pagamentosElegiveis.length === 0 || !form.pagamento_id}
              className="px-4 py-2 text-sm bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-60"
            >
              {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

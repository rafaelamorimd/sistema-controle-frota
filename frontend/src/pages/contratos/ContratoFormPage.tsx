import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { contratoService } from '../../services/contratoService'
import { veiculoService } from '../../services/veiculoService'
import { condutorService } from '../../services/condutorService'
import type { Veiculo, Condutor, Contrato } from '../../types'

/** Converte data ISO retornada pela API para valor de input type="date" (yyyy-MM-dd). */
function strParaInputData(str: string | null | undefined): string {
  if (!str) return ''
  return str.slice(0, 10)
}

function strMensagemErroApi(err: unknown, strFallback: string): string {
  if (
    isAxiosError(err) &&
    err.response?.data &&
    typeof err.response.data === 'object' &&
    err.response.data !== null &&
    'message' in err.response.data
  ) {
    const msg = (err.response.data as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return strFallback
}

export default function ContratoFormPage() {
  const { id: strIdContrato } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const bolRotaComIdParam = strIdContrato != null && strIdContrato !== ''
  const numIdContrato = bolRotaComIdParam ? Number(strIdContrato) : NaN
  const isModoEdicao = bolRotaComIdParam && Number.isFinite(numIdContrato)

  const [form, setForm] = useState({
    condutor_id: '',
    veiculo_id: '',
    data_inicio: '',
    data_fim: '',
    valor_semanal: '',
    dia_pagamento: 1,
    caucao: '',
    km_inicial: '',
    clausulas_adicionais: '',
  })
  const [error, setError] = useState('')

  const {
    data: objContrato,
    isLoading: bolCarregandoContrato,
    isError: bolErroBusca,
    error: objErroBusca,
    refetch: fnRefetchContrato,
  } = useQuery({
    queryKey: ['contrato', strIdContrato],
    queryFn: () => contratoService.buscar(numIdContrato),
    enabled: isModoEdicao,
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', { modo: isModoEdicao ? 'form-editar' : 'form-novo' }],
    queryFn: () =>
      veiculoService.listar(
        isModoEdicao ? { por_pagina: 200 } : { status: 'DISPONIVEL', por_pagina: 100 },
      ),
  })

  const { data: condutoresData } = useQuery({
    queryKey: ['condutores', { modo: isModoEdicao ? 'form-editar' : 'form-novo' }],
    queryFn: () =>
      condutorService.listar(
        isModoEdicao ? { por_pagina: 200 } : { status: 'ATIVO', por_pagina: 100 },
      ),
  })

  const arrVeiculosLista: Veiculo[] = veiculosData?.data || []
  const arrCondutoresLista: Condutor[] = condutoresData?.data || []

  const arrVeiculosOpcoes = useMemo(() => {
    const arr = [...arrVeiculosLista]
    if (objContrato?.veiculo && !arr.some((v) => v.id === objContrato.veiculo_id)) {
      arr.unshift(objContrato.veiculo)
    }
    return arr
  }, [arrVeiculosLista, objContrato])

  const arrCondutoresOpcoes = useMemo(() => {
    const arr = [...arrCondutoresLista]
    if (objContrato?.condutor && !arr.some((c) => c.id === objContrato.condutor_id)) {
      arr.unshift(objContrato.condutor)
    }
    return arr
  }, [arrCondutoresLista, objContrato])

  useEffect(() => {
    if (!objContrato) return
    setForm({
      condutor_id: String(objContrato.condutor_id),
      veiculo_id: String(objContrato.veiculo_id),
      data_inicio: strParaInputData(objContrato.data_inicio),
      data_fim: strParaInputData(objContrato.data_fim ?? ''),
      valor_semanal: String(objContrato.valor_semanal),
      dia_pagamento: objContrato.dia_pagamento,
      caucao: objContrato.caucao != null ? String(objContrato.caucao) : '',
      km_inicial: String(objContrato.km_inicial),
      clausulas_adicionais: objContrato.clausulas_adicionais || '',
    })
  }, [objContrato])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isModoEdicao
        ? contratoService.atualizar(numIdContrato, data as Partial<Contrato>)
        : contratoService.criar(data as Partial<Contrato>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      if (isModoEdicao) queryClient.invalidateQueries({ queryKey: ['contrato', strIdContrato] })
      navigate('/contratos')
    },
    onError: (err: unknown) =>
      setError(
        strMensagemErroApi(err, isModoEdicao ? 'Erro ao atualizar contrato' : 'Erro ao criar contrato'),
      ),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate({
      condutor_id: Number(form.condutor_id),
      veiculo_id: Number(form.veiculo_id),
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
      valor_semanal: Number(form.valor_semanal),
      dia_pagamento: form.dia_pagamento,
      km_inicial: Number(form.km_inicial),
      caucao: form.caucao ? Number(form.caucao) : null,
      clausulas_adicionais: form.clausulas_adicionais || null,
    })
  }

  const set = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }))

  if (bolRotaComIdParam && !isModoEdicao) {
    return (
      <div className="max-w-3xl">
        <p className="text-red-600">Identificador do contrato inválido.</p>
        <button
          type="button"
          onClick={() => navigate('/contratos')}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Voltar à lista
        </button>
      </div>
    )
  }

  if (isModoEdicao && bolCarregandoContrato) {
    return (
      <div className="max-w-3xl">
        <p className="text-gray-600">Carregando contrato…</p>
      </div>
    )
  }

  if (isModoEdicao && bolErroBusca) {
    const bolNaoEncontrado = isAxiosError(objErroBusca) && objErroBusca.response?.status === 404
    return (
      <div className="max-w-3xl space-y-4">
        <p className="text-red-600">
          {bolNaoEncontrado
            ? 'Contrato não encontrado.'
            : strMensagemErroApi(objErroBusca, 'Não foi possível carregar o contrato. Tente novamente.')}
        </p>
        {!bolNaoEncontrado && (
          <button
            type="button"
            onClick={() => void fnRefetchContrato()}
            className="px-4 py-2 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-secondary-hover"
          >
            Tentar novamente
          </button>
        )}
        <div>
          <button
            type="button"
            onClick={() => navigate('/contratos')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Voltar à lista
          </button>
        </div>
      </div>
    )
  }

  if (isModoEdicao && !objContrato) {
    return (
      <div className="max-w-3xl">
        <p className="text-red-600">Contrato não encontrado.</p>
        <button
          type="button"
          onClick={() => navigate('/contratos')}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Voltar à lista
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isModoEdicao ? 'Editar contrato' : 'Novo contrato'}
      </h2>
      {isModoEdicao && objContrato && (
        <p className="text-sm text-gray-500 mb-6 font-mono">
          {objContrato.numero_contrato}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condutor *</label>
            <select
              value={form.condutor_id}
              onChange={(e) => set('condutor_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
              required
            >
              <option value="">Selecione...</option>
              {arrCondutoresOpcoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} - {c.cpf}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veículo *</label>
            <select
              value={form.veiculo_id}
              onChange={(e) => set('veiculo_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
              required
            >
              <option value="">Selecione...</option>
              {arrVeiculosOpcoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.modelo} - {v.placa}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início *</label>
            <input
              type="date"
              value={form.data_inicio}
              onChange={(e) => set('data_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data fim (opcional)</label>
            <input
              type="date"
              value={form.data_fim}
              onChange={(e) => set('data_fim', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Semanal (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={form.valor_semanal}
              onChange={(e) => set('valor_semanal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia do pagamento *</label>
            <select
              value={form.dia_pagamento}
              onChange={(e) => set('dia_pagamento', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
            >
              <option value={1}>Segunda</option>
              <option value={2}>Terça</option>
              <option value={3}>Quarta</option>
              <option value={4}>Quinta</option>
              <option value={5}>Sexta</option>
              <option value={6}>Sábado</option>
              <option value={7}>Domingo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KM Inicial *</label>
            <input
              type="number"
              value={form.km_inicial}
              onChange={(e) => set('km_inicial', e.target.value)}
              disabled={isModoEdicao}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none disabled:bg-gray-100 disabled:text-gray-600"
              required={!isModoEdicao}
            />
            {isModoEdicao && (
              <p className="text-xs text-gray-500 mt-1">Registrado no cadastro.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caução (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.caucao}
              onChange={(e) => set('caucao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cláusulas adicionais</label>
          <textarea
            value={form.clausulas_adicionais}
            onChange={(e) => set('clausulas_adicionais', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-secondary-hover disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? (isModoEdicao ? 'Salvando...' : 'Criando...') : isModoEdicao ? 'Salvar alterações' : 'Criar contrato'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/contratos')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

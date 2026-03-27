import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, FileDown, ImagePlus, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { checklistRevisaoService } from '../../services/checklistRevisaoService'
import { relatorioService } from '../../services/relatorioService'
import { revisaoCategoriaService } from '../../services/revisaoCategoriaService'
import { veiculoService } from '../../services/veiculoService'
import type { ChecklistRevisao, ChecklistRevisaoFoto, RevisaoCategoria } from '../../types'
import {
  fnInicializarEstadoItens,
  fnMapearJsonParaEstado,
  fnMontarItensVerificadosJson,
  fnResumoChecklistHumano,
  type StatusInspecaoItem,
} from '../../utils/checklistRevisao'
import { fnResolverUrlPublica, formatarDataHoraBr } from '../../utils/format'

const arrOpcoesStatus: {
  strValor: StatusInspecaoItem
  strLabel: string
  strEmoji: string
  strClasses: string
  strRingAtivo: string
}[] = [
  {
    strValor: 'ok',
    strLabel: 'OK',
    strEmoji: '🟢',
    strClasses: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
    strRingAtivo: 'ring-2 ring-emerald-500 ring-offset-1',
  },
  {
    strValor: 'verificar',
    strLabel: 'Verificar',
    strEmoji: '🟡',
    strClasses: 'border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100',
    strRingAtivo: 'ring-2 ring-amber-500 ring-offset-1',
  },
  {
    strValor: 'trocar',
    strLabel: 'Trocar / defeito',
    strEmoji: '🔴',
    strClasses: 'border-red-200 bg-red-50 text-red-950 hover:bg-red-100',
    strRingAtivo: 'ring-2 ring-red-500 ring-offset-1',
  },
]

export default function ChecklistRevisaoPage() {
  const queryClient = useQueryClient()
  const [veiculoId, setVeiculoId] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [objChecklistEditando, setObjChecklistEditando] = useState<ChecklistRevisao | null>(null)
  const [form, setForm] = useState({
    data_revisao: new Date().toISOString().slice(0, 10),
    km_revisao: '',
  })
  const [objEstadoItens, setObjEstadoItens] = useState<
    Record<string, { strStatus: StatusInspecaoItem; strObs: string }>
  >({})
  const [numBaixandoPdf, setNumBaixandoPdf] = useState<number | null>(null)
  const [arrArquivosPendentes, setArrArquivosPendentes] = useState<File[]>([])
  const [bolUploadFotoEmAndamento, setBolUploadFotoEmAndamento] = useState(false)
  const [numFotoRemovendoId, setNumFotoRemovendoId] = useState<number | null>(null)
  const refInputFotos = useRef<HTMLInputElement>(null)

  const arrUrlsPreviewPendentes = useMemo(
    () => arrArquivosPendentes.map((f) => URL.createObjectURL(f)),
    [arrArquivosPendentes],
  )

  useEffect(() => {
    return () => {
      arrUrlsPreviewPendentes.forEach((strUrl) => URL.revokeObjectURL(strUrl))
    }
  }, [arrUrlsPreviewPendentes])

  const { data: arrCategorias = [], isLoading: bolCarregandoCategorias } = useQuery({
    queryKey: ['revisao-categorias'],
    queryFn: () => revisaoCategoriaService.listar(),
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['checklist-revisoes', veiculoId],
    queryFn: () => checklistRevisaoService.listarPorVeiculo(Number(veiculoId), { por_pagina: 50 }),
    enabled: !!veiculoId,
  })

  useEffect(() => {
    if (!modalAberto || bolCarregandoCategorias) return
    if (!arrCategorias.length) return
    if (objChecklistEditando) {
      setForm({
        data_revisao: objChecklistEditando.data_revisao.slice(0, 10),
        km_revisao: String(objChecklistEditando.km_revisao),
      })
      setObjEstadoItens(
        fnMapearJsonParaEstado(objChecklistEditando.itens_verificados ?? {}, arrCategorias),
      )
    } else {
      setForm({
        data_revisao: new Date().toISOString().slice(0, 10),
        km_revisao: '',
      })
      setObjEstadoItens(fnInicializarEstadoItens(arrCategorias))
    }
  }, [modalAberto, objChecklistEditando, arrCategorias, bolCarregandoCategorias])

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const numKm = Number(form.km_revisao)
      if (Number.isNaN(numKm) || numKm < 0) {
        throw new Error('Informe um km de revisão válido.')
      }
      const objItens = fnMontarItensVerificadosJson(objEstadoItens, arrCategorias)
      const arrPend = arrArquivosPendentes
      if (objChecklistEditando) {
        const data = await checklistRevisaoService.atualizar(objChecklistEditando.id, {
          data_revisao: form.data_revisao,
          km_revisao: numKm,
          itens_verificados: objItens,
        })
        return { data, arrPendUpload: [] as File[] }
      }
      const data = await checklistRevisaoService.criar({
        veiculo_id: Number(veiculoId),
        data_revisao: form.data_revisao,
        km_revisao: numKm,
        itens_verificados: objItens,
      })
      return { data, arrPendUpload: arrPend }
    },
    onSuccess: async (payload) => {
      if (payload.arrPendUpload.length > 0) {
        try {
          for (const arquivo of payload.arrPendUpload) {
            await checklistRevisaoService.adicionarFoto(payload.data.id, arquivo)
          }
        } catch {
          alert('Checklist salvo, mas alguma foto não foi enviada.')
        }
      }
      setArrArquivosPendentes([])
      queryClient.invalidateQueries({ queryKey: ['checklist-revisoes'] })
      setModalAberto(false)
      setObjChecklistEditando(null)
    },
  })

  const veiculos = veiculosData?.data ?? []
  const lista: ChecklistRevisao[] = data?.data ?? []

  const fnDefinirStatus = (strChave: string, strStatus: StatusInspecaoItem) => {
    setObjEstadoItens((prev) => ({
      ...prev,
      [strChave]: {
        strStatus,
        strObs: strStatus === 'ok' ? '' : prev[strChave]?.strObs ?? '',
      },
    }))
  }

  const fnDefinirObs = (strChave: string, strObs: string) => {
    setObjEstadoItens((prev) => ({
      ...prev,
      [strChave]: { ...prev[strChave], strObs },
    }))
  }

  const fnAbrirNovo = () => {
    setObjChecklistEditando(null)
    setModalAberto(true)
  }

  const fnAbrirEditar = (c: ChecklistRevisao) => {
    setObjChecklistEditando(c)
    setModalAberto(true)
  }

  const fnFecharModal = () => {
    setModalAberto(false)
    setObjChecklistEditando(null)
    setArrArquivosPendentes([])
  }

  const numTotalFotos =
    (objChecklistEditando?.fotos?.length ?? 0) + arrArquivosPendentes.length
  const bolLimiteFotos = numTotalFotos >= 20

  const fnEscolherFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    e.target.value = ''
    const numMax = 20
    const numAtual = (objChecklistEditando?.fotos?.length ?? 0) + arrArquivosPendentes.length
    const arrNovos = Array.from(files).slice(0, Math.max(0, numMax - numAtual))
    if (arrNovos.length === 0) {
      alert('Limite de 20 fotos por checklist.')
      return
    }
    if (arrNovos.length < files.length) {
      alert(`Apenas as primeiras ${arrNovos.length} foto(s) foram incluídas (máximo 20 por checklist).`)
    }
    if (!objChecklistEditando) {
      setArrArquivosPendentes((prev) => [...prev, ...arrNovos])
      return
    }
    setBolUploadFotoEmAndamento(true)
    try {
      for (const arquivo of arrNovos) {
        const nova: ChecklistRevisaoFoto = await checklistRevisaoService.adicionarFoto(
          objChecklistEditando.id,
          arquivo,
        )
        setObjChecklistEditando((prev) =>
          prev ? { ...prev, fotos: [...(prev.fotos ?? []), nova] } : null,
        )
      }
      queryClient.invalidateQueries({ queryKey: ['checklist-revisoes'] })
    } catch {
      alert('Erro ao enviar foto.')
    } finally {
      setBolUploadFotoEmAndamento(false)
    }
  }

  const fnRemoverFotoSalva = async (numFotoId: number) => {
    if (!objChecklistEditando) return
    setNumFotoRemovendoId(numFotoId)
    try {
      await checklistRevisaoService.removerFoto(objChecklistEditando.id, numFotoId)
      setObjChecklistEditando((prev) =>
        prev ? { ...prev, fotos: (prev.fotos ?? []).filter((f) => f.id !== numFotoId) } : null,
      )
      queryClient.invalidateQueries({ queryKey: ['checklist-revisoes'] })
    } catch {
      alert('Erro ao remover foto.')
    } finally {
      setNumFotoRemovendoId(null)
    }
  }

  const fnRemoverPendente = (numIndice: number) => {
    setArrArquivosPendentes((prev) => prev.filter((_, i) => i !== numIndice))
  }

  const fnBaixarPdf = async (id: number) => {
    setNumBaixandoPdf(id)
    try {
      await relatorioService.downloadPdfChecklistRevisao(id)
    } catch {
      alert('Erro ao baixar PDF.')
    } finally {
      setNumBaixandoPdf(null)
    }
  }

  const arrColumns: Column<ChecklistRevisao>[] = [
    {
      strLabel: 'Data',
      strKey: 'data',
      render: (c) => (
        <span className="text-gray-700 whitespace-nowrap">{formatarDataHoraBr(c.data_revisao)}</span>
      ),
    },
    {
      strLabel: 'Km',
      strKey: 'km',
      render: (c) => <span className="text-gray-700">{c.km_revisao}</span>,
    },
    {
      strLabel: 'Itens (resumo)',
      strKey: 'itens',
      render: (c) => (
        <span
          className="text-xs text-gray-700 line-clamp-2"
          title={fnResumoChecklistHumano(c.itens_verificados ?? {}, arrCategorias)}
        >
          {fnResumoChecklistHumano(c.itens_verificados ?? {}, arrCategorias)}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'Ações',
      strKey: 'acoes',
      render: (c) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fnAbrirEditar(c)}
            className="inline-flex items-center gap-1 text-sm text-brand-secondary font-medium hover:underline"
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            type="button"
            disabled={numBaixandoPdf === c.id}
            onClick={() => fnBaixarPdf(c.id)}
            className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-brand-primary"
          >
            <FileDown size={14} /> PDF
          </button>
        </div>
      ),
    },
  ]

  const strErroMutation =
    salvarMutation.isError && salvarMutation.error instanceof Error
      ? salvarMutation.error.message
      : salvarMutation.isError
        ? 'Não foi possível salvar.'
        : null

  const bolSemItensCadastro = !bolCarregandoCategorias && arrCategorias.length === 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-brand-secondary" size={28} />
            Checklist de revisão
          </h1>
        </div>
        <button
          type="button"
          disabled={!veiculoId || bolSemItensCadastro}
          onClick={fnAbrirNovo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50 text-sm font-medium"
        >
          <Plus size={18} /> Novo registro
        </button>
      </div>

      {bolSemItensCadastro && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950">
          Não há categorias de inspeção cadastradas.{' '}
          <Link to="/revisao/categorias" className="font-semibold underline">
            Cadastrar categorias
          </Link>
        </div>
      )}

      <div className="flex gap-2 items-center mb-6">
        <label className="text-sm text-gray-600">Veículo</label>
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[220px]"
        >
          <option value="">Selecione</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.modelo}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!veiculoId ? (
          <div className="p-8 text-center text-gray-500">Escolha um veiculo</div>
        ) : (
          <ResponsiveTable
            arrColumns={arrColumns}
            arrData={lista}
            fnKeyExtractor={(c) => c.id}
            bolLoading={isLoading}
            strEmptyMessage="Nenhum checklist encontrado."
            fnRenderCardHeader={(c) => (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 whitespace-nowrap">
                  {formatarDataHoraBr(c.data_revisao)}
                </span>
                <span className="text-sm text-brand-primary font-mono">{c.km_revisao} km</span>
              </div>
            )}
          />
        )}
      </div>

      <Modal
        aberto={modalAberto}
        aoFechar={fnFecharModal}
        titulo={objChecklistEditando ? 'Editar checklist de revisão' : 'Novo checklist de revisão'}
        strMaxWidthClass="max-w-2xl"
      >
        <div className="space-y-5">
          {bolCarregandoCategorias ? (
            <p className="text-sm text-gray-500">Carregando formulário…</p>
          ) : bolSemItensCadastro ? (
            <p className="text-sm text-amber-800">
              Cadastre categorias em{' '}
              <Link to="/revisao/categorias" className="underline font-medium">
                Revisão → Categorias
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Data da revisão
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary outline-none"
                    value={form.data_revisao}
                    onChange={(e) => setForm((f) => ({ ...f, data_revisao: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Km da revisão
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary outline-none"
                    placeholder="Ex: 45200"
                    value={form.km_revisao}
                    onChange={(e) => setForm((f) => ({ ...f, km_revisao: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <ImagePlus size={18} className="text-brand-secondary shrink-0" />
                  Fotos (opcional)
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {objChecklistEditando
                    ? 'JPG, PNG ou WebP até 10 MB por arquivo. Máximo 20 fotos por checklist.'
                    : 'Após salvar o checklist, as fotos serão enviadas automaticamente. Você também pode escolher arquivos agora e enviá-los ao salvar.'}
                </p>
                <input
                  ref={refInputFotos}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={fnEscolherFotos}
                  disabled={bolUploadFotoEmAndamento}
                />
                <button
                  type="button"
                  disabled={bolUploadFotoEmAndamento || bolSemItensCadastro || bolLimiteFotos}
                  onClick={() => refInputFotos.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {bolUploadFotoEmAndamento ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                  Adicionar fotos
                </button>
                {(objChecklistEditando?.fotos?.length ?? 0) > 0 || arrArquivosPendentes.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(objChecklistEditando?.fotos ?? []).map((foto) => (
                      <div
                        key={foto.id}
                        className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-100 aspect-square"
                      >
                        <img
                          src={fnResolverUrlPublica(foto.url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={numFotoRemovendoId === foto.id}
                          onClick={() => fnRemoverFotoSalva(foto.id)}
                          className="absolute top-1 right-1 p-1.5 rounded-md bg-black/50 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/70 transition-opacity disabled:opacity-100"
                          aria-label="Remover foto"
                        >
                          {numFotoRemovendoId === foto.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                    {arrArquivosPendentes.map((_, numIndice) => (
                      <div
                        key={`pend-${numIndice}`}
                        className="relative group rounded-lg border border-dashed border-brand-secondary/40 overflow-hidden bg-gray-50 aspect-square"
                      >
                        <img
                          src={arrUrlsPreviewPendentes[numIndice]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          Pendente
                        </span>
                        <button
                          type="button"
                          onClick={() => fnRemoverPendente(numIndice)}
                          className="absolute top-1 right-1 p-1.5 rounded-md bg-black/50 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/70 transition-opacity"
                          aria-label="Remover da fila"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-gray-100 pt-1">
                <p className="text-sm font-medium text-gray-800 mb-3">Inspeção por categoria</p>
                <div className="space-y-4 max-h-[min(52vh,420px)] overflow-y-auto pr-1 -mr-1">
                  {arrCategorias.map((cat: RevisaoCategoria) => (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-gray-200 bg-gray-50/80 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 bg-white border-b border-gray-100 text-sm font-semibold text-gray-900">
                        {cat.nome}
                      </div>
                      <div className="p-3 space-y-4">
                        {(cat.itens_checklist ?? [])
                          .slice()
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((item) => {
                            const estado = objEstadoItens[item.chave]
                            const bolMostrarObs =
                              estado?.strStatus === 'verificar' || estado?.strStatus === 'trocar'
                            return (
                              <div
                                key={item.id}
                                className="rounded-lg bg-white border border-gray-100 p-3 shadow-sm"
                              >
                                <p className="text-sm text-gray-800 font-medium mb-2">{item.label}</p>
                                <div className="flex flex-wrap gap-2">
                                  {arrOpcoesStatus.map((op) => {
                                    const bolSelecionado = estado?.strStatus === op.strValor
                                    return (
                                      <button
                                        key={op.strValor}
                                        type="button"
                                        onClick={() => fnDefinirStatus(item.chave, op.strValor)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${op.strClasses} ${bolSelecionado ? op.strRingAtivo : ''}`}
                                      >
                                        <span aria-hidden>{op.strEmoji}</span>
                                        {op.strLabel}
                                      </button>
                                    )
                                  })}
                                </div>
                                {bolMostrarObs && (
                                  <div className="mt-3">
                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                      Observação (opcional)
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                                      placeholder="Detalhe o ponto de atenção ou defeito..."
                                      value={estado?.strObs ?? ''}
                                      onChange={(e) => fnDefinirObs(item.chave, e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {strErroMutation && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {strErroMutation}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={fnFecharModal}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={salvarMutation.isPending || bolCarregandoCategorias || bolSemItensCadastro}
              onClick={() => salvarMutation.mutate()}
              className="flex-1 py-2.5 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-60 text-sm font-medium"
            >
              {salvarMutation.isPending ? 'Salvando…' : 'Salvar checklist'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

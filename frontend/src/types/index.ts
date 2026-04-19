export interface User {
  id: number
  name: string
  email: string
  perfil: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR'
  ativo: boolean
}

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  ano: number
  renavam: string
  chassi: string | null
  cor: string
  combustivel: string
  kit_gas: boolean
  vencimento_gnv: string | null
  km_atual: number
  km_ultima_troca_oleo: number
  status: 'DISPONIVEL' | 'ALUGADO' | 'MANUTENCAO' | 'INATIVO'
  numero_rastreador: string | null
  veiculo_id_externo: string | null
  rastreador_ativo: boolean
  valor_rastreador: string
  vencimento_ipva: string | null
  vencimento_seguro: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface Condutor {
  id: number
  nome: string
  cpf: string
  telefone: string
  email: string | null
  endereco: string
  numero_cnh: string
  categoria_cnh: string
  vencimento_cnh: string
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
  observacoes: string | null
  documentos?: CondutorDocumento[]
  referencias?: CondutorReferencia[]
  created_at: string
  updated_at: string
}

export interface CondutorDocumento {
  id: number
  condutor_id: number
  tipo_documento: string
  caminho_arquivo: string
  uploaded_at: string
}

export interface CondutorReferencia {
  id: number
  condutor_id: number
  nome: string
  telefone: string
  grau_relacionamento: string | null
}

export interface Contrato {
  id: number
  numero_contrato: string
  condutor_id: number
  veiculo_id: number
  data_inicio: string
  data_fim: string | null
  valor_semanal: string
  dia_pagamento: number
  caucao: string | null
  status: 'ATIVO' | 'ENCERRADO' | 'CANCELADO' | 'SUSPENSO'
  km_inicial: number
  km_final: number | null
  caminho_contrato_pdf: string | null
  clausulas_adicionais: string | null
  motivo_encerramento: string | null
  condutor?: Condutor
  veiculo?: Veiculo
  created_at: string
  updated_at: string
}

export interface Vistoria {
  id: number
  contrato_id: number
  veiculo_id: number
  tipo: 'ENTREGA' | 'DEVOLUCAO' | 'PERIODICA'
  data_vistoria: string
  km_momento: number
  nivel_combustivel: string | null
  observacoes: string | null
  status: 'RASCUNHO' | 'FINALIZADA'
  itens?: VistoriaItem[]
  fotos?: VistoriaFoto[]
  created_at: string
}

export interface VistoriaItem {
  id: number
  vistoria_id: number
  item_verificado: string
  estado: 'BOM' | 'AVARIADO' | 'FALTANTE'
  observacao: string | null
}

export interface VistoriaFoto {
  id: number
  vistoria_id: number
  vistoria_item_id: number | null
  caminho_arquivo: string
  descricao: string | null
  uploaded_at: string
}

export interface Alerta {
  id: number
  tipo_alerta: string
  entidade_tipo: string
  entidade_id: number
  mensagem: string
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA'
  lido: boolean
  resolvido: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AuthResponse {
  user: User
  token: string
}

/** Campos conforme modelo/API de pagamentos (valor único no backend). */
export interface Pagamento {
  id: number
  contrato_id: number
  veiculo_id: number
  condutor_id: number
  data_referencia: string
  data_pagamento: string | null
  valor: string
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO'
  caminho_comprovante: string | null
  observacoes: string | null
  contrato?: Contrato
  veiculo?: Veiculo
  condutor?: Condutor
  created_at: string
  updated_at: string
}

/** Leitura de km: `data_leitura` pode ser exibida via `created_at` se a API não enviar campo dedicado. */
export interface LeituraKm {
  id: number
  veiculo_id: number
  contrato_id: number | null
  condutor_id: number | null
  data_referencia?: string | null
  data_leitura?: string
  km: number
  km_anterior?: number
  km_percorrido?: number
  caminho_foto: string
  observacoes: string | null
  contrato?: Contrato
  veiculo?: Veiculo
  condutor?: Condutor
  created_at: string
  updated_at: string
}

export interface Despesa {
  id: number
  veiculo_id: number
  categoria: string | null
  descricao: string
  valor: string
  data_vencimento: string | null
  data_pagamento: string | null
  status: 'PENDENTE' | 'PAGO'
  caminho_comprovante: string | null
  observacoes: string | null
  veiculo?: Veiculo
  created_at: string
  updated_at: string
}

export interface FulltrackPosicao {
  ras_vei_id: string
  ras_vei_placa: string
  ras_vei_veiculo: string
  ras_eve_latitude: string
  ras_eve_longitude: string
  ras_eve_velocidade: string
  ras_eve_ignicao: string
  ras_eve_data_gps: string
  ras_eve_voltagem: string
  ras_eve_satelites: string
  veiculo_id: number | null
  veiculo_modelo?: string | null
  veiculo_status?: string | null
  contrato_ativo?: boolean
}

export interface DashboardResumo {
  veiculos_total: number
  veiculos_alugados: number
  condutores_ativos: number
  contratos_ativos: number
  alertas_ativos: number
  pagamentos_atrasados?: number
  receitas_mes_atual?: number
  despesas_mes_atual?: number
  renda_liquida_mes_atual?: number
  rastreador_total_gps?: number
  rastreador_ignicao_ligada?: number
  rastreador_ignicao_desligada?: number
  rastreador_alertas_gps?: number
  rastreador_posicoes?: FulltrackPosicao[]
}

export interface DashboardRendaPorVeiculo {
  veiculo_id: number
  receitas_pagas: number
  despesas_pagas: number
  renda_liquida: number
}

export interface DashboardRendaLiquida {
  mes_referencia: string
  receitas_pagas: number
  despesas_pagas: number
  renda_liquida: number
  por_veiculo: DashboardRendaPorVeiculo[]
}

export interface DashboardAlertas {
  total_ativos: number
  itens: Alerta[]
}

export interface Manutencao {
  id: number
  veiculo_id: number
  tipo: 'PREVENTIVA' | 'CORRETIVA' | 'PREDITIVA'
  descricao: string
  data_entrada: string
  data_saida: string | null
  km_entrada: number
  custo_total: string
  valor_mao_obra?: string
  servicos_externos?: { descricao: string; valor: number }[] | null
  local: string | null
  status: 'EM_ANDAMENTO' | 'CONCLUIDA'
  observacoes: string | null
  veiculo?: Veiculo
  itens?: ManutencaoItem[]
  created_at: string
  updated_at: string
}

export interface ManutencaoItem {
  id: number
  manutencao_id: number
  peca_id: number | null
  servico_realizado: string
  quantidade: number
  custo_unitario: string
  custo_total: string
  peca?: Peca
}

export interface Peca {
  id: number
  nome: string
  codigo: string | null
  categoria: string | null
  quantidade_estoque: number
  estoque_minimo: number | null
  custo_medio: string | null
  created_at: string
  updated_at: string
}

export interface MovimentacaoPeca {
  id: number
  peca_id: number
  tipo: 'ENTRADA' | 'SAIDA'
  quantidade: number
  manutencao_id: number | null
  veiculo_id: number | null
  custo_unitario: string
  observacao: string | null
  created_at: string
  updated_at: string
}

export interface Multa {
  id: number
  veiculo_id: number
  condutor_id: number | null
  contrato_id: number | null
  auto_infracao: string | null
  data_infracao: string
  descricao: string
  valor: string
  data_vencimento: string
  status: 'PENDENTE' | 'PAGA' | 'RECURSO' | 'TRANSFERIDA_CONDUTOR'
  indicada_condutor: boolean
  caminho_comprovante: string | null
  observacoes: string | null
  veiculo?: Veiculo
  condutor?: Condutor
  contrato?: Contrato
  created_at: string
  updated_at: string
}

export interface ChecklistRevisaoFoto {
  id: number
  checklist_revisao_id: number
  caminho_arquivo: string
  url: string
  created_at: string
  updated_at: string
}

export interface ChecklistRevisao {
  id: number
  veiculo_id: number
  manutencao_id: number | null
  data_revisao: string
  km_revisao: number
  itens_verificados: Record<string, unknown>
  fotos?: ChecklistRevisaoFoto[]
  veiculo?: Veiculo
  created_at: string
  updated_at: string
}

export interface RevisaoChecklistItem {
  id: number
  revisao_categoria_id: number
  chave: string
  label: string
  ordem: number
  created_at?: string
  updated_at?: string
}

export interface RevisaoCategoria {
  id: number
  slug: string
  nome: string
  ordem: number
  itens_checklist: RevisaoChecklistItem[]
  created_at?: string
  updated_at?: string
}

export interface RastreadorEvento {
  id: number
  veiculo_id: number
  tipo_evento: string
  origem_evento: string
  status_comando: string
  detalhes: string | null
  created_at: string
  updated_at: string
}

export interface FulltrackVeiculo {
  ras_vei_id: string
  ras_vei_placa: string
  ras_vei_veiculo: string
  ras_vei_modelo?: string
  ras_vei_ano?: string
  ras_vei_equipamento?: string
  observation?: string
  veiculo_id: number | null
  veiculo_status?: string | null
  veiculo_modelo?: string | null
  contrato_ativo?: boolean
}

export interface FulltrackAlerta {
  _id: string
  ras_eal_descricao: string
  ras_eal_data_alerta: string
  ras_eal_id_alerta_tipo: string
  ras_eal_latitude: string
  ras_eal_longitude: string
  ras_eal_id_veiculo: string
  veiculo_id: number | null
  veiculo_placa: string | null
  contrato_ativo?: boolean
}

export interface RastreadorResumoGps {
  posicoes: FulltrackPosicao[]
  rastreador_total_gps: number
  rastreador_ignicao_ligada: number
  rastreador_ignicao_desligada: number
  rastreador_alertas_gps: number
}

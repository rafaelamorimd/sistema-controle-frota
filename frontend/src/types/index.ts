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

export interface DashboardResumo {
  veiculos_total: number
  veiculos_alugados: number
  condutores_ativos: number
  contratos_ativos: number
  alertas_ativos: number
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
  tipo: 'PREVENTIVA' | 'CORRETIVA'
  descricao: string
  data_entrada: string
  data_saida: string | null
  km_entrada: number
  custo_total: string
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

export interface ChecklistRevisao {
  id: number
  veiculo_id: number
  manutencao_id: number | null
  data_revisao: string
  km_revisao: number
  itens_verificados: Record<string, unknown>
  veiculo?: Veiculo
  created_at: string
  updated_at: string
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

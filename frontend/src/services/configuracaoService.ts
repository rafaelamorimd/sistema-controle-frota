import api from './api';

export interface ConfiguracaoLocador {
  locador_nome?: string;
  locador_cpf?: string;
  locador_endereco?: string;
  locador_pix?: string;
  locador_banco?: string;
  locador_cidade_uf?: string;
}

export const configuracaoService = {
  obter: async (): Promise<ConfiguracaoLocador> => {
    const res = await api.get('/configuracoes');
    return res.data;
  },

  atualizar: async (dados: ConfiguracaoLocador): Promise<void> => {
    await api.put('/configuracoes', dados);
  },
};

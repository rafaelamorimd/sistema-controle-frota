import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { configuracaoService } from '../../services/configuracaoService';
import type { ConfiguracaoLocador } from '../../services/configuracaoService';

export default function ConfiguracoesPage() {
  const [bolCarregando, setBolCarregando] = useState(true);
  const [bolSalvando, setBolSalvando] = useState(false);
  const [objForm, setObjForm] = useState<ConfiguracaoLocador>({
    locador_nome: '',
    locador_cpf: '',
    locador_endereco: '',
    locador_pix: '',
    locador_banco: '',
    locador_cidade_uf: '',
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const dados = await configuracaoService.obter();
      setObjForm({
        locador_nome: dados.locador_nome || '',
        locador_cpf: dados.locador_cpf || '',
        locador_endereco: dados.locador_endereco || '',
        locador_pix: dados.locador_pix || '',
        locador_banco: dados.locador_banco || '',
        locador_cidade_uf: dados.locador_cidade_uf || '',
      });
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
    } finally {
      setBolCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBolSalvando(true);

    try {
      await configuracaoService.atualizar(objForm);
      alert('Configurações salvas com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar configurações:', erro);
      alert('Erro ao salvar configurações.');
    } finally {
      setBolSalvando(false);
    }
  };

  if (bolCarregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações do Locador</h1>
        <p className="text-gray-600 mb-6">
          Estas informações serão utilizadas na geração dos contratos de locação em PDF.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_nome}
                onChange={(e) => setObjForm({ ...objForm, locador_nome: e.target.value })}
                placeholder="Nome do locador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_cpf}
                onChange={(e) => setObjForm({ ...objForm, locador_cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cidade/UF</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_cidade_uf}
                onChange={(e) => setObjForm({ ...objForm, locador_cidade_uf: e.target.value })}
                placeholder="Ex: São Paulo/SP"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço Completo</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_endereco}
                onChange={(e) => setObjForm({ ...objForm, locador_endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chave PIX</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_pix}
                onChange={(e) => setObjForm({ ...objForm, locador_pix: e.target.value })}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dados Bancários</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={objForm.locador_banco}
                onChange={(e) => setObjForm({ ...objForm, locador_banco: e.target.value })}
                placeholder="Banco, agência, conta"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={bolSalvando}
              className="bg-brand-secondary text-white px-6 py-2 rounded hover:bg-brand-secondary-hover disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {bolSalvando ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

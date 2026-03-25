<?php

namespace Database\Seeders;

use App\Enums\StatusCondutor;
use App\Enums\StatusContrato;
use App\Enums\StatusDespesa;
use App\Enums\StatusPagamento;
use App\Enums\StatusVeiculo;
use App\Models\Condutor;
use App\Models\Contrato;
use App\Models\Despesa;
use App\Models\LeituraKm;
use App\Models\Pagamento;
use App\Models\Veiculo;
use Illuminate\Database\Seeder;

class LocalDadosSeeder extends Seeder
{
    private const strMarcadorSeed = '[seed-local-demo]';

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('LocalDadosSeeder ignorado em producao.');

            return;
        }

        $this->limparRegistrosMarcados();

        $arrVeiculos = $this->criarVeiculos();
        $arrCondutores = $this->criarCondutores();
        $this->criarContratosEPagamentos($arrVeiculos, $arrCondutores);
        $this->criarLeiturasKm($arrVeiculos, $arrCondutores);
        $this->criarDespesas($arrVeiculos);

        $this->command->info('Dados locais: '.count($arrVeiculos).' veiculos, '.count($arrCondutores).' condutores, contratos e registros relacionados.');
    }

    private function limparRegistrosMarcados(): void
    {
        $strMarcador = self::strMarcadorSeed;

        Despesa::query()->where('observacoes', 'like', '%'.$strMarcador.'%')->delete();
        LeituraKm::query()->where('observacoes', 'like', '%'.$strMarcador.'%')->delete();
        Pagamento::query()->where('observacoes', 'like', '%'.$strMarcador.'%')->delete();
        Contrato::query()->where('clausulas_adicionais', 'like', '%'.$strMarcador.'%')->delete();
    }

    /**
     * @return array<int, Veiculo>
     */
    private function criarVeiculos(): array
    {
        $arrDefinicoes = [
            ['placa' => 'RIO2A34', 'modelo' => 'Fiat Argo Drive 1.0', 'ano' => 2022, 'renavam' => '12345678901', 'chassi' => '9BWZZZ377VT004251', 'cor' => 'Branco', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 28500, 'status' => StatusVeiculo::DISPONIVEL, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10001'],
            ['placa' => 'SPB3F56', 'modelo' => 'Chevrolet Onix LT 1.0', 'ano' => 2021, 'renavam' => '23456789012', 'chassi' => '9BGKS48Z0PB123456', 'cor' => 'Prata', 'combustivel' => 'Flex', 'kit_gas' => true, 'vencimento_gnv' => now()->addMonths(8), 'km_atual' => 45200, 'status' => StatusVeiculo::ALUGADO, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10002'],
            ['placa' => 'MGK7H89', 'modelo' => 'Hyundai HB20 1.0', 'ano' => 2023, 'renavam' => '34567890123', 'chassi' => '9BHBG51CAOP123456', 'cor' => 'Cinza', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 12000, 'status' => StatusVeiculo::ALUGADO, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10003'],
            ['placa' => 'BHZ9J12', 'modelo' => 'Volkswagen Polo 1.6', 'ano' => 2020, 'renavam' => '45678901234', 'chassi' => '9BWZZZ6CZLP123456', 'cor' => 'Azul', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 67800, 'status' => StatusVeiculo::MANUTENCAO, 'rastreador_ativo' => false],
            ['placa' => 'CUR4L55', 'modelo' => 'Renault Kwid Zen', 'ano' => 2022, 'renavam' => '56789012345', 'chassi' => '9BRBB48E0N0123456', 'cor' => 'Vermelho', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 19800, 'status' => StatusVeiculo::DISPONIVEL, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10005'],
            ['placa' => 'POA8M77', 'modelo' => 'Toyota Corolla XEi 2.0', 'ano' => 2019, 'renavam' => '67890123456', 'chassi' => '9BRBL48E0N0123457', 'cor' => 'Preto', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 92000, 'status' => StatusVeiculo::INATIVO, 'rastreador_ativo' => false],
            ['placa' => 'FLN1N88', 'modelo' => 'Honda City Touring', 'ano' => 2023, 'renavam' => '78901234567', 'chassi' => '9BRBL48E0N0123458', 'cor' => 'Branco perola', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 8500, 'status' => StatusVeiculo::DISPONIVEL, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10007'],
            ['placa' => 'SSA6P99', 'modelo' => 'Nissan Kicks Advance', 'ano' => 2021, 'renavam' => '89012345678', 'chassi' => '9BRBL48E0N0123459', 'cor' => 'Laranja', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 41000, 'status' => StatusVeiculo::ALUGADO, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10008'],
            ['placa' => 'REC2Q11', 'modelo' => 'Fiat Mobi Like', 'ano' => 2020, 'renavam' => '90123456789', 'chassi' => '9BRBL48E0N0123460', 'cor' => 'Amarelo', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 55000, 'status' => StatusVeiculo::DISPONIVEL, 'rastreador_ativo' => false],
            ['placa' => 'FOR5R22', 'modelo' => 'Peugeot 208 Active', 'ano' => 2022, 'renavam' => '01234567890', 'chassi' => '9BRBL48E0N0123461', 'cor' => 'Verde', 'combustivel' => 'Flex', 'kit_gas' => false, 'km_atual' => 22300, 'status' => StatusVeiculo::DISPONIVEL, 'rastreador_ativo' => true, 'numero_rastreador' => 'RST-10010'],
        ];

        $arrVeiculos = [];
        foreach ($arrDefinicoes as $arrDados) {
            $strPlaca = $arrDados['placa'];
            unset($arrDados['placa']);
            $arrDados['km_ultima_troca_oleo'] = max(0, ($arrDados['km_atual'] ?? 0) - 5000);
            $arrDados['vencimento_ipva'] = $arrDados['vencimento_ipva'] ?? now()->addMonths(4)->startOfMonth();
            $arrDados['vencimento_seguro'] = $arrDados['vencimento_seguro'] ?? now()->addMonths(6);
            $arrDados['observacoes'] = 'Veiculo de demonstracao local. '.self::strMarcadorSeed;

            $objVeiculo = Veiculo::updateOrCreate(
                ['placa' => $strPlaca],
                $arrDados
            );
            $arrVeiculos[] = $objVeiculo;
        }

        return $arrVeiculos;
    }

    /**
     * @return array<int, Condutor>
     */
    private function criarCondutores(): array
    {
        $arrDefinicoes = [
            ['cpf' => '52998224725', 'nome' => 'Carlos Eduardo Silva', 'telefone' => '(21) 98765-4321', 'email' => 'carlos.silva@email.com', 'endereco' => 'Rua das Flores, 120 - Centro, Rio de Janeiro/RJ', 'numero_cnh' => '12345678900', 'categoria_cnh' => 'B', 'vencimento_cnh' => now()->addYear()],
            ['cpf' => '39053344705', 'nome' => 'Maria Fernanda Costa', 'telefone' => '(11) 91234-5678', 'email' => 'maria.costa@email.com', 'endereco' => 'Av. Paulista, 1500 - Bela Vista, Sao Paulo/SP', 'numero_cnh' => '23456789011', 'categoria_cnh' => 'B', 'vencimento_cnh' => now()->addMonths(18)],
            ['cpf' => '86288366757', 'nome' => 'Joao Pedro Oliveira', 'telefone' => '(31) 99876-5432', 'email' => 'joao.oliveira@email.com', 'endereco' => 'Rua da Bahia, 800 - Centro, Belo Horizonte/MG', 'numero_cnh' => '34567890122', 'categoria_cnh' => 'AB', 'vencimento_cnh' => now()->addMonths(24)],
            ['cpf' => '19119037734', 'nome' => 'Ana Lucia Santos', 'telefone' => '(71) 98111-2233', 'email' => 'ana.santos@email.com', 'endereco' => 'Rua Chile, 45 - Pelourinho, Salvador/BA', 'numero_cnh' => '45678901233', 'categoria_cnh' => 'B', 'vencimento_cnh' => now()->addMonths(10)],
        ];

        $arrCondutores = [];
        foreach ($arrDefinicoes as $arrDados) {
            $strCpf = $arrDados['cpf'];
            unset($arrDados['cpf']);
            $arrDados['status'] = StatusCondutor::ATIVO;
            $arrDados['observacoes'] = 'Condutor demo local. '.self::strMarcadorSeed;

            $objCondutor = Condutor::updateOrCreate(
                ['cpf' => $strCpf],
                $arrDados
            );
            $arrCondutores[] = $objCondutor;
        }

        return $arrCondutores;
    }

    /**
     * @param  array<int, Veiculo>  $arrVeiculos
     * @param  array<int, Condutor>  $arrCondutores
     */
    private function criarContratosEPagamentos(array $arrVeiculos, array $arrCondutores): void
    {
        $arrLigacoes = [
            ['idxVeiculo' => 1, 'idxCondutor' => 0, 'numValorSemanal' => 380.00, 'numDiaPagamento' => 5],
            ['idxVeiculo' => 2, 'idxCondutor' => 1, 'numValorSemanal' => 420.00, 'numDiaPagamento' => 2],
            ['idxVeiculo' => 7, 'idxCondutor' => 2, 'numValorSemanal' => 450.00, 'numDiaPagamento' => 1],
        ];

        foreach ($arrLigacoes as $numI => $arrLig) {
            $objVeiculo = $arrVeiculos[$arrLig['idxVeiculo']];
            $objCondutor = $arrCondutores[$arrLig['idxCondutor']];
            $strNumero = 'CTR-DEMO-2026-'.str_pad((string) ($numI + 1), 3, '0', STR_PAD_LEFT);

            $objContrato = Contrato::updateOrCreate(
                ['numero_contrato' => $strNumero],
                [
                    'condutor_id' => $objCondutor->id,
                    'veiculo_id' => $objVeiculo->id,
                    'data_inicio' => now()->subWeeks(4),
                    'data_fim' => null,
                    'valor_semanal' => $arrLig['numValorSemanal'],
                    'dia_pagamento' => $arrLig['numDiaPagamento'],
                    'caucao' => 800.00,
                    'status' => StatusContrato::ATIVO,
                    'km_inicial' => max(0, $objVeiculo->km_atual - 1200),
                    'km_final' => null,
                    'clausulas_adicionais' => 'Contrato gerado pelo LocalDadosSeeder. '.self::strMarcadorSeed,
                ]
            );

            $objVeiculo->update([
                'status' => StatusVeiculo::ALUGADO,
            ]);

            Pagamento::create([
                'contrato_id' => $objContrato->id,
                'veiculo_id' => $objVeiculo->id,
                'condutor_id' => $objCondutor->id,
                'valor' => $arrLig['numValorSemanal'],
                'data_referencia' => now()->subWeek()->startOfWeek(),
                'status' => StatusPagamento::PAGO,
                'data_pagamento' => now()->subWeek()->addDays(2),
                'observacoes' => 'Pagamento semana anterior (demo). '.self::strMarcadorSeed,
            ]);

            Pagamento::create([
                'contrato_id' => $objContrato->id,
                'veiculo_id' => $objVeiculo->id,
                'condutor_id' => $objCondutor->id,
                'valor' => $arrLig['numValorSemanal'],
                'data_referencia' => now()->startOfWeek(),
                'status' => StatusPagamento::PENDENTE,
                'observacoes' => 'Pagamento semana corrente (demo). '.self::strMarcadorSeed,
            ]);
        }
    }

    /**
     * @param  array<int, Veiculo>  $arrVeiculos
     * @param  array<int, Condutor>  $arrCondutores
     */
    private function criarLeiturasKm(array $arrVeiculos, array $arrCondutores): void
    {
        $arrLeituras = [
            ['idxVeiculo' => 1, 'idxCondutor' => 0, 'numKmDelta' => -800],
            ['idxVeiculo' => 2, 'idxCondutor' => 1, 'numKmDelta' => -400],
            ['idxVeiculo' => 7, 'idxCondutor' => 2, 'numKmDelta' => -200],
        ];

        foreach ($arrLeituras as $arrL) {
            $objV = $arrVeiculos[$arrL['idxVeiculo']];
            $objC = $arrCondutores[$arrL['idxCondutor']];
            $objContrato = Contrato::query()
                ->where('veiculo_id', $objV->id)
                ->where('status', StatusContrato::ATIVO)
                ->first();

            LeituraKm::create([
                'veiculo_id' => $objV->id,
                'contrato_id' => $objContrato?->id,
                'condutor_id' => $objC->id,
                'km' => max(0, $objV->km_atual + $arrL['numKmDelta']),
                'caminho_foto' => 'seed/leitura-km-placeholder.jpg',
                'observacoes' => 'Leitura demo. '.self::strMarcadorSeed,
            ]);
        }
    }

    /**
     * @param  array<int, Veiculo>  $arrVeiculos
     */
    private function criarDespesas(array $arrVeiculos): void
    {
        Despesa::create([
            'veiculo_id' => $arrVeiculos[3]->id,
            'descricao' => 'Revisao preventiva e troca de oleo',
            'categoria' => 'MANUTENCAO',
            'valor' => 680.00,
            'data_vencimento' => now()->addDays(10),
            'status' => StatusDespesa::PENDENTE,
            'observacoes' => 'Demo manutencao. '.self::strMarcadorSeed,
        ]);

        Despesa::create([
            'veiculo_id' => $arrVeiculos[0]->id,
            'descricao' => 'Lavagem e higienizacao',
            'categoria' => 'OPERACIONAL',
            'valor' => 85.00,
            'data_vencimento' => null,
            'data_pagamento' => now()->subDays(3),
            'status' => StatusDespesa::PAGO,
            'observacoes' => 'Demo despesa paga. '.self::strMarcadorSeed,
        ]);
    }
}

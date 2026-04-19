<?php

namespace Tests\Feature;

use App\Enums\StatusCondutor;
use App\Enums\StatusContrato;
use App\Enums\StatusPagamento;
use App\Enums\StatusVeiculo;
use App\Models\Condutor;
use App\Models\Contrato;
use App\Models\LeituraKm;
use App\Models\Pagamento;
use App\Models\Veiculo;
use App\Services\CicloContratoService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CicloContratoKmTest extends TestCase
{
    use RefreshDatabase;

    public function test_calcular_km_usa_marco_do_quinto_pagamento_e_leitura_ate_essa_data(): void
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'Motorista Teste',
            'cpf' => '52998224725',
            'telefone' => '21999999999',
            'endereco' => 'Rua Teste',
            'numero_cnh' => '12345678900',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'TST1A11',
            'modelo' => 'Teste',
            'ano' => 2020,
            'renavam' => '12345678901',
            'cor' => 'Branco',
            'combustivel' => 'Flex',
            'km_inicial' => 70000,
            'km_atual' => 70000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-TEST-KM-01',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-04-01',
            'data_fim' => null,
            'valor_semanal' => 500.00,
            'dia_pagamento' => 4,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 62029,
        ]);

        $arrDatasReferencia = [
            '2026-04-01',
            '2026-04-08',
            '2026-04-15',
            '2026-04-22',
            '2026-04-29',
        ];

        foreach ($arrDatasReferencia as $strData) {
            Pagamento::query()->create([
                'contrato_id' => $objContrato->id,
                'veiculo_id' => $objVeiculo->id,
                'condutor_id' => $objCondutor->id,
                'valor' => 500,
                'data_referencia' => $strData,
                'status' => StatusPagamento::PENDENTE,
            ]);
        }

        $objLeituraAntiga = LeituraKm::query()->create([
            'veiculo_id' => $objVeiculo->id,
            'contrato_id' => $objContrato->id,
            'condutor_id' => $objCondutor->id,
            'km' => 66074,
            'caminho_foto' => 'leituras/test-antiga.jpg',
            'observacoes' => null,
        ]);
        $objLeituraAntiga->forceFill(['created_at' => Carbon::parse('2026-04-22 10:00:00')])->save();

        $objLeituraNoCiclo = LeituraKm::query()->create([
            'veiculo_id' => $objVeiculo->id,
            'contrato_id' => $objContrato->id,
            'condutor_id' => $objCondutor->id,
            'km' => 67034,
            'caminho_foto' => 'leituras/test-quinto.jpg',
            'observacoes' => null,
        ]);
        $objLeituraNoCiclo->forceFill(['created_at' => Carbon::parse('2026-04-29 18:00:00')])->save();

        $objServico = new CicloContratoService;
        $numKmRodado = $objServico->calcularKmRodadoPrimeiroCicloQuatroSemanas($objContrato->fresh());

        $this->assertSame(67034 - 62029, $numKmRodado);
    }

    public function test_retorna_null_se_menos_de_cinco_pagamentos(): void
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'C2',
            'cpf' => '39053344705',
            'telefone' => '11988887777',
            'endereco' => 'X',
            'numero_cnh' => '12345678901',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'TST2B22',
            'modelo' => 'Teste',
            'ano' => 2021,
            'renavam' => '98765432109',
            'cor' => 'Preto',
            'combustivel' => 'Flex',
            'km_inicial' => 50000,
            'km_atual' => 50000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-TEST-KM-02',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-05-01',
            'valor_semanal' => 400.00,
            'dia_pagamento' => 3,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 10000,
        ]);

        for ($numI = 0; $numI < 4; $numI++) {
            Pagamento::query()->create([
                'contrato_id' => $objContrato->id,
                'veiculo_id' => $objVeiculo->id,
                'condutor_id' => $objCondutor->id,
                'valor' => 400,
                'data_referencia' => Carbon::parse('2026-05-01')->addWeeks($numI)->toDateString(),
                'status' => StatusPagamento::PENDENTE,
            ]);
        }

        $objServico = new CicloContratoService;
        $this->assertNull($objServico->calcularKmRodadoPrimeiroCicloQuatroSemanas($objContrato->fresh()));
    }

    public function test_retorna_null_sem_leitura_aplicavel(): void
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'C3',
            'cpf' => '86288366757',
            'telefone' => '31977776666',
            'endereco' => 'Y',
            'numero_cnh' => '12345678902',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'TST3C33',
            'modelo' => 'Teste',
            'ano' => 2019,
            'renavam' => '11122233344',
            'cor' => 'Prata',
            'combustivel' => 'Gasolina',
            'km_inicial' => 40000,
            'km_atual' => 40000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-TEST-KM-03',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-06-01',
            'valor_semanal' => 300.00,
            'dia_pagamento' => 2,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 5000,
        ]);

        foreach (range(0, 4) as $numSemana) {
            Pagamento::query()->create([
                'contrato_id' => $objContrato->id,
                'veiculo_id' => $objVeiculo->id,
                'condutor_id' => $objCondutor->id,
                'valor' => 300,
                'data_referencia' => Carbon::parse('2026-06-01')->addWeeks($numSemana)->toDateString(),
                'status' => StatusPagamento::PENDENTE,
            ]);
        }

        $objServico = new CicloContratoService;
        $this->assertNull($objServico->calcularKmRodadoPrimeiroCicloQuatroSemanas($objContrato->fresh()));
    }
}

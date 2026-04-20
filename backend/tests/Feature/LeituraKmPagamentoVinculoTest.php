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
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeituraKmPagamentoVinculoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Veiculo, 1: Pagamento}
     */
    private function criarVeiculoComPagamentoPagoSemLeitura(): array
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'Condutor Km Pag',
            'cpf' => '52998224725',
            'telefone' => '21988887777',
            'endereco' => 'Rua Km',
            'numero_cnh' => '12345678901',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'KMZ0A01',
            'modelo' => 'Teste',
            'ano' => 2021,
            'renavam' => '98765432109',
            'cor' => 'Prata',
            'combustivel' => 'Flex',
            'km_inicial' => 5000,
            'km_atual' => 5000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-KM-PAG-01',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-04-01',
            'data_fim' => null,
            'valor_semanal' => 400.00,
            'dia_pagamento' => 4,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 5000,
        ]);

        $objPagamento = Pagamento::query()->create([
            'contrato_id' => $objContrato->id,
            'veiculo_id' => $objVeiculo->id,
            'condutor_id' => $objCondutor->id,
            'valor' => 400,
            'data_referencia' => '2026-04-01',
            'status' => StatusPagamento::PAGO,
            'data_pagamento' => '2026-04-03',
        ]);

        return [$objVeiculo, $objPagamento];
    }

    public function test_post_leitura_com_pagamento_id_cria_vinculo(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objVeiculo, $objPagamento] = $this->criarVeiculoComPagamentoPagoSemLeitura();

        $response = $this->postJson("/api/veiculos/{$objVeiculo->id}/leituras-km", [
            'km' => 5200,
            'data_leitura' => '2026-04-04',
            'pagamento_id' => $objPagamento->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('leituras_km', [
            'pagamento_id' => $objPagamento->id,
            'veiculo_id' => $objVeiculo->id,
            'km' => 5200,
        ]);
    }

    public function test_segundo_vinculo_mesmo_pagamento_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objVeiculo, $objPagamento] = $this->criarVeiculoComPagamentoPagoSemLeitura();

        LeituraKm::query()->create([
            'veiculo_id' => $objVeiculo->id,
            'contrato_id' => $objPagamento->contrato_id,
            'condutor_id' => $objPagamento->condutor_id,
            'pagamento_id' => $objPagamento->id,
            'km' => 5200,
            'data_leitura' => '2026-04-04',
            'data_referencia' => '2026-04-01',
            'caminho_foto' => '',
            'observacoes' => null,
        ]);

        $response = $this->postJson("/api/veiculos/{$objVeiculo->id}/leituras-km", [
            'km' => 5300,
            'data_leitura' => '2026-04-05',
            'pagamento_id' => $objPagamento->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_get_pagamentos_elegiveis_lista_sem_leitura(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objVeiculo, $objPagamento] = $this->criarVeiculoComPagamentoPagoSemLeitura();

        $response = $this->get("/api/veiculos/{$objVeiculo->id}/pagamentos-elegiveis-leitura-km");

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertSame($objPagamento->id, $data[0]['id']);
    }

    public function test_post_leitura_sem_pagamento_id_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objVeiculo] = $this->criarVeiculoComPagamentoPagoSemLeitura();

        $response = $this->postJson("/api/veiculos/{$objVeiculo->id}/leituras-km", [
            'km' => 5200,
            'data_leitura' => '2026-04-04',
        ]);

        $response->assertStatus(422);
    }

    public function test_post_leitura_com_contrato_id_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objVeiculo, $objPagamento] = $this->criarVeiculoComPagamentoPagoSemLeitura();

        $response = $this->postJson("/api/veiculos/{$objVeiculo->id}/leituras-km", [
            'km' => 5200,
            'data_leitura' => '2026-04-04',
            'pagamento_id' => $objPagamento->id,
            'contrato_id' => $objPagamento->contrato_id,
        ]);

        $response->assertStatus(422);
    }
}

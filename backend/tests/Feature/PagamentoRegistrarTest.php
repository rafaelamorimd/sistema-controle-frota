<?php

namespace Tests\Feature;

use App\Enums\StatusCondutor;
use App\Enums\StatusContrato;
use App\Enums\StatusPagamento;
use App\Enums\StatusVeiculo;
use App\Models\Condutor;
use App\Models\Contrato;
use App\Models\Pagamento;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PagamentoRegistrarTest extends TestCase
{
    use RefreshDatabase;

    private function criarPagamentoPendente(): Pagamento
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'Condutor Pag Test',
            'cpf' => '52998224725',
            'telefone' => '21999999999',
            'endereco' => 'Rua Teste',
            'numero_cnh' => '12345678900',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'PGT0A00',
            'modelo' => 'Teste',
            'ano' => 2020,
            'renavam' => '12345678901',
            'cor' => 'Branco',
            'combustivel' => 'Flex',
            'km_atual' => 10000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-PG-REG-01',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-04-01',
            'data_fim' => null,
            'valor_semanal' => 500.00,
            'dia_pagamento' => 4,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 9000,
        ]);

        return Pagamento::query()->create([
            'contrato_id' => $objContrato->id,
            'veiculo_id' => $objVeiculo->id,
            'condutor_id' => $objCondutor->id,
            'valor' => 500,
            'data_referencia' => '2026-04-01',
            'status' => StatusPagamento::PENDENTE,
        ]);
    }

    public function test_registrar_pago_com_data_real_grava_data_pagamento(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objPagamento = $this->criarPagamentoPendente();

        $response = $this->post("/api/pagamentos/{$objPagamento->id}/registrar", [
            'valor' => '500.00',
            'status' => 'PAGO',
            'data_pagamento' => '2026-04-05',
        ]);

        $response->assertOk();
        $objPagamento->refresh();
        $this->assertSame('2026-04-05', $objPagamento->data_pagamento?->toDateString());
        $this->assertSame(StatusPagamento::PAGO, $objPagamento->status);
    }

    public function test_registrar_pago_sem_data_usa_data_referencia(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objPagamento = $this->criarPagamentoPendente();

        $response = $this->post("/api/pagamentos/{$objPagamento->id}/registrar", [
            'valor' => '500.00',
            'status' => 'PAGO',
        ]);

        $response->assertOk();
        $objPagamento->refresh();
        $this->assertSame('2026-04-01', $objPagamento->data_pagamento?->toDateString());
    }

    public function test_registrar_sem_comprovante_mantem_caminho_nulo(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objPagamento = $this->criarPagamentoPendente();
        $this->assertNull($objPagamento->caminho_comprovante);

        $response = $this->post("/api/pagamentos/{$objPagamento->id}/registrar", [
            'valor' => '500.00',
            'status' => 'PAGO',
            'data_pagamento' => '2026-04-02',
        ]);

        $response->assertOk();
        $objPagamento->refresh();
        $this->assertNull($objPagamento->caminho_comprovante);
    }

    public function test_registrar_com_comprovante_grava_arquivo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $objPagamento = $this->criarPagamentoPendente();

        $response = $this->post("/api/pagamentos/{$objPagamento->id}/registrar", [
            'valor' => '500.00',
            'status' => 'PAGO',
            'data_pagamento' => '2026-04-02',
            'comprovante' => UploadedFile::fake()->create('comp.pdf', 120, 'application/pdf'),
        ]);

        $response->assertOk();
        $objPagamento->refresh();
        $this->assertNotNull($objPagamento->caminho_comprovante);
        Storage::disk('public')->assertExists($objPagamento->caminho_comprovante);
    }

    public function test_registrar_pendente_zera_data_pagamento(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objPagamento = $this->criarPagamentoPendente();

        $response = $this->post("/api/pagamentos/{$objPagamento->id}/registrar", [
            'valor' => '500.00',
            'status' => 'PENDENTE',
        ]);

        $response->assertOk();
        $objPagamento->refresh();
        $this->assertNull($objPagamento->data_pagamento);
        $this->assertSame(StatusPagamento::PENDENTE, $objPagamento->status);
    }
}

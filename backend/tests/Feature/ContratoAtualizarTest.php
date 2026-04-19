<?php

namespace Tests\Feature;

use App\Enums\StatusCondutor;
use App\Enums\StatusContrato;
use App\Enums\StatusVeiculo;
use App\Models\Condutor;
use App\Models\Contrato;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContratoAtualizarTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{Condutor, Veiculo, Contrato}
     */
    private function criarContratoBase(): array
    {
        $objCondutor = Condutor::query()->create([
            'nome' => 'Condutor Update Test',
            'cpf' => '52998224725',
            'telefone' => '21999999999',
            'endereco' => 'Rua Teste',
            'numero_cnh' => '12345678900',
            'categoria_cnh' => 'B',
            'vencimento_cnh' => '2030-12-31',
            'status' => StatusCondutor::ATIVO,
        ]);

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'UPD0A00',
            'modelo' => 'Teste',
            'ano' => 2020,
            'renavam' => '12345678901',
            'cor' => 'Branco',
            'combustivel' => 'Flex',
            'km_inicial' => 10000,
            'km_atual' => 10000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $objContrato = Contrato::query()->create([
            'numero_contrato' => 'CTR-UPD-01',
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-04-01',
            'data_fim' => null,
            'valor_semanal' => 500.00,
            'dia_pagamento' => 4,
            'status' => StatusContrato::ATIVO,
            'km_inicial' => 9000,
        ]);

        return [$objCondutor, $objVeiculo, $objContrato];
    }

    public function test_put_atualiza_campos_do_contrato_quando_autenticado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objCondutor, $objVeiculo, $objContrato] = $this->criarContratoBase();

        $response = $this->putJson("/api/contratos/{$objContrato->id}", [
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-04-01',
            'data_fim' => null,
            'valor_semanal' => 650.50,
            'dia_pagamento' => 2,
            'caucao' => 100.00,
            'km_inicial' => 9000,
            'clausulas_adicionais' => 'Texto extra',
        ]);

        $response->assertOk();
        $objContrato->refresh();
        $this->assertSame('650.50', $objContrato->valor_semanal);
        $this->assertSame(2, $objContrato->dia_pagamento);
        $this->assertSame('100.00', $objContrato->caucao);
        $this->assertSame('Texto extra', $objContrato->clausulas_adicionais);
    }

    public function test_put_rejeita_data_fim_antes_de_data_inicio(): void
    {
        Sanctum::actingAs(User::factory()->create());

        [$objCondutor, $objVeiculo, $objContrato] = $this->criarContratoBase();

        $response = $this->putJson("/api/contratos/{$objContrato->id}", [
            'condutor_id' => $objCondutor->id,
            'veiculo_id' => $objVeiculo->id,
            'data_inicio' => '2026-06-01',
            'data_fim' => '2026-05-01',
            'valor_semanal' => 500.00,
            'dia_pagamento' => 4,
            'caucao' => null,
            'km_inicial' => 9000,
            'clausulas_adicionais' => null,
        ]);

        $response->assertUnprocessable();
    }
}

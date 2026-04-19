<?php

namespace Tests\Feature;

use App\Enums\StatusDespesa;
use App\Enums\StatusManutencao;
use App\Enums\StatusVeiculo;
use App\Enums\TipoManutencao;
use App\Models\Despesa;
use App\Models\Manutencao;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ManutencaoConcluirDespesaTest extends TestCase
{
    use RefreshDatabase;

    public function test_concluir_manutencao_cria_despesa_paga_quando_custo_maior_zero(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'MNT0B00',
            'modelo' => 'Teste',
            'ano' => 2021,
            'renavam' => '98765432109',
            'cor' => 'Preto',
            'combustivel' => 'Flex',
            'km_inicial' => 20000,
            'km_atual' => 20000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $responseCriar = $this->postJson('/api/manutencoes', [
            'veiculo_id' => $objVeiculo->id,
            'tipo' => TipoManutencao::PREVENTIVA->value,
            'descricao' => 'Revisao teste despesa',
            'data_entrada' => '2026-04-10',
            'km_entrada' => 19900,
            'valor_mao_obra' => 250.75,
            'custo_total' => 0,
        ]);

        $responseCriar->assertCreated();
        $numIdManutencao = $responseCriar->json('id');
        $this->assertIsInt($numIdManutencao);

        $objManutencao = Manutencao::query()->findOrFail($numIdManutencao);
        $this->assertSame(250.75, (float) $objManutencao->custo_total);
        $this->assertSame(StatusManutencao::EM_ANDAMENTO, $objManutencao->status);

        $responseConcluir = $this->patchJson("/api/manutencoes/{$numIdManutencao}/concluir", [
            'data_saida' => '2026-04-12',
        ]);

        $responseConcluir->assertOk();
        $objManutencao->refresh();
        $this->assertSame(StatusManutencao::CONCLUIDA, $objManutencao->status);

        $objDespesa = Despesa::query()->where('manutencao_id', $numIdManutencao)->first();
        $this->assertNotNull($objDespesa);
        $this->assertSame($objVeiculo->id, $objDespesa->veiculo_id);
        $this->assertSame(StatusDespesa::PAGO, $objDespesa->status);
        $this->assertSame('2026-04-12', $objDespesa->data_pagamento?->toDateString());
        $this->assertEqualsWithDelta(250.75, (float) $objDespesa->valor, 0.01);
        $this->assertStringContainsString('Manutencao #'.$numIdManutencao, $objDespesa->descricao);
    }

    public function test_concluir_manutencao_sem_custo_nao_cria_despesa(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'MNT0C00',
            'modelo' => 'Teste',
            'ano' => 2022,
            'renavam' => '11122233344',
            'cor' => 'Prata',
            'combustivel' => 'Flex',
            'km_inicial' => 30000,
            'km_atual' => 30000,
            'status' => StatusVeiculo::ALUGADO,
        ]);

        $responseCriar = $this->postJson('/api/manutencoes', [
            'veiculo_id' => $objVeiculo->id,
            'tipo' => TipoManutencao::CORRETIVA->value,
            'descricao' => 'Sem custo',
            'data_entrada' => '2026-04-11',
            'km_entrada' => 29900,
            'valor_mao_obra' => 0,
            'custo_total' => 0,
        ]);

        $responseCriar->assertCreated();
        $numIdManutencao = $responseCriar->json('id');

        $this->patchJson("/api/manutencoes/{$numIdManutencao}/concluir", [
            'data_saida' => '2026-04-13',
        ])->assertOk();

        $this->assertNull(Despesa::query()->where('manutencao_id', $numIdManutencao)->first());
    }
}

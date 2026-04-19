<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Veiculo;
use App\Services\FulltrackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RastreadorSyncKmTest extends TestCase
{
    use RefreshDatabase;

    public function test_sincronizacao_fulltrack_eleva_km_atual_com_hodometro(): void
    {
        Config::set('rastreador.driver', 'fulltrack');
        Config::set('rastreador.fulltrack.api_key', 'x');
        Config::set('rastreador.fulltrack.secret_key', 'y');

        $this->mock(FulltrackService::class, function ($mock): void {
            $mock->shouldReceive('buscarEventoVeiculo')
                ->once()
                ->with('ft-99')
                ->andReturn([
                    [
                        'ras_vei_id' => 'ft-99',
                        'ras_vei_placa' => 'RST1D99',
                        'ras_eve_hodometro' => 50000,
                    ],
                ]);
        });

        Sanctum::actingAs(User::factory()->create());

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'RST1D99',
            'modelo' => 'Teste',
            'ano' => 2020,
            'renavam' => '12345678901',
            'cor' => 'Branco',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'km_inicial' => 10000,
            'km_atual' => 10000,
            'km_ultima_troca_oleo' => 8000,
            'veiculo_id_externo' => 'ft-99',
        ]);

        $response = $this->postJson('/api/veiculos/'.$objVeiculo->id.'/rastreador/sincronizar');

        $response->assertCreated();
        $objVeiculo->refresh();
        $this->assertSame(50000, $objVeiculo->km_atual);
        $this->assertSame(50000, $objVeiculo->km_rastreador);
        $this->assertNotNull($objVeiculo->dth_ultimo_km_rastreador);
    }

    public function test_sincronizacao_nao_regride_km_atual_quando_hodometro_menor(): void
    {
        Config::set('rastreador.driver', 'fulltrack');
        Config::set('rastreador.fulltrack.api_key', 'x');
        Config::set('rastreador.fulltrack.secret_key', 'y');

        $this->mock(FulltrackService::class, function ($mock): void {
            $mock->shouldReceive('buscarEventoVeiculo')
                ->once()
                ->with('ft-88')
                ->andReturn([
                    [
                        'ras_vei_id' => 'ft-88',
                        'ras_vei_placa' => 'RST2D88',
                        'ras_eve_hodometro' => 40000,
                    ],
                ]);
        });

        Sanctum::actingAs(User::factory()->create());

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'RST2D88',
            'modelo' => 'Teste',
            'ano' => 2021,
            'renavam' => '98765432109',
            'cor' => 'Preto',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'km_inicial' => 45000,
            'km_atual' => 60000,
            'km_ultima_troca_oleo' => 50000,
            'veiculo_id_externo' => 'ft-88',
        ]);

        $response = $this->postJson('/api/veiculos/'.$objVeiculo->id.'/rastreador/sincronizar');

        $response->assertCreated();
        $objVeiculo->refresh();
        $this->assertSame(60000, $objVeiculo->km_atual);
        $this->assertSame(40000, $objVeiculo->km_rastreador);
    }
}

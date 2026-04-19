<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VeiculoKmInicialTest extends TestCase
{
    use RefreshDatabase;

    public function test_cadastro_persiste_km_inicial_e_km_atual(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/veiculos', [
            'placa' => 'KMI1D23',
            'modelo' => 'Veiculo Teste KM',
            'ano' => 2022,
            'renavam' => '99887766554',
            'chassi' => null,
            'cor' => 'Branco',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'vencimento_gnv' => null,
            'km_inicial' => 15000,
            'km_atual' => 15500,
            'km_ultima_troca_oleo' => 12000,
            'numero_rastreador' => null,
            'veiculo_id_externo' => null,
            'rastreador_ativo' => false,
            'valor_rastreador' => 53,
            'vencimento_ipva' => null,
            'vencimento_seguro' => null,
            'observacoes' => null,
        ]);

        $response->assertCreated();
        $this->assertSame(15000, $response->json('km_inicial'));
        $this->assertSame(15500, $response->json('km_atual'));
    }

    public function test_cadastro_sem_km_inicial_usa_km_atual(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/veiculos', [
            'placa' => 'KMI2D23',
            'modelo' => 'Veiculo Teste KM 2',
            'ano' => 2021,
            'renavam' => '88776655443',
            'chassi' => null,
            'cor' => 'Prata',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'vencimento_gnv' => null,
            'km_atual' => 42000,
            'km_ultima_troca_oleo' => 38000,
            'numero_rastreador' => null,
            'veiculo_id_externo' => null,
            'rastreador_ativo' => false,
            'valor_rastreador' => 53,
            'vencimento_ipva' => null,
            'vencimento_seguro' => null,
            'observacoes' => null,
        ]);

        $response->assertCreated();
        $this->assertSame(42000, $response->json('km_inicial'));
        $this->assertSame(42000, $response->json('km_atual'));
    }

    public function test_cadastro_rejeita_km_inicial_maior_que_km_atual(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/veiculos', [
            'placa' => 'KMI4D23',
            'modelo' => 'Invalid KM',
            'ano' => 2023,
            'renavam' => '66554433221',
            'chassi' => null,
            'cor' => 'Cinza',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'vencimento_gnv' => null,
            'km_inicial' => 90000,
            'km_atual' => 10000,
            'km_ultima_troca_oleo' => 8000,
            'numero_rastreador' => null,
            'veiculo_id_externo' => null,
            'rastreador_ativo' => false,
            'valor_rastreador' => 53,
            'vencimento_ipva' => null,
            'vencimento_seguro' => null,
            'observacoes' => null,
        ]);

        $response->assertStatus(422);
    }

    public function test_edicao_nao_altera_km_inicial(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $objVeiculo = Veiculo::query()->create([
            'placa' => 'KMI3D23',
            'modelo' => 'Edit',
            'ano' => 2020,
            'renavam' => '77665544332',
            'cor' => 'Azul',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'km_inicial' => 10000,
            'km_atual' => 12000,
            'km_ultima_troca_oleo' => 9000,
        ]);

        // Payload sem km_inicial (como o frontend na edição); imutabilidade continua no VeiculoService.
        $response = $this->putJson('/api/veiculos/'.$objVeiculo->id, [
            'placa' => 'KMI3D23',
            'modelo' => 'Edit',
            'ano' => 2020,
            'renavam' => '77665544332',
            'chassi' => null,
            'cor' => 'Azul',
            'combustivel' => 'FLEX',
            'kit_gas' => false,
            'vencimento_gnv' => null,
            'km_atual' => 13000,
            'km_ultima_troca_oleo' => 9000,
            'numero_rastreador' => null,
            'veiculo_id_externo' => null,
            'rastreador_ativo' => false,
            'valor_rastreador' => 53,
            'vencimento_ipva' => null,
            'vencimento_seguro' => null,
            'observacoes' => null,
        ]);

        $response->assertOk();
        $this->assertSame(10000, $response->json('km_inicial'));
        $this->assertSame(13000, $response->json('km_atual'));
    }
}

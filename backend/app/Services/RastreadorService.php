<?php

namespace App\Services;

use App\Models\RastreadorEvento;
use App\Models\Veiculo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RastreadorService
{
    public function listarEventos(Veiculo $veiculo, int $numLimite = 50): array
    {
        return $veiculo->rastreadorEventos()
            ->orderByDesc('created_at')
            ->limit($numLimite)
            ->get()
            ->all();
    }

    public function sincronizar(Veiculo $veiculo): RastreadorEvento
    {
        $strDriver = config('rastreador.driver', 'stub');

        if ($strDriver === 'http' && config('rastreador.api_url')) {
            return $this->sincronizarHttp($veiculo);
        }

        return $this->sincronizarStub($veiculo);
    }

    private function sincronizarStub(Veiculo $veiculo): RastreadorEvento
    {
        return RastreadorEvento::create([
            'veiculo_id' => $veiculo->id,
            'tipo_evento' => 'SINCRONIZACAO',
            'origem_evento' => 'STUB',
            'status_comando' => 'OK',
            'detalhes' => 'Sincronizacao simulada. Rastreador: '.($veiculo->numero_rastreador ?? 'n/d').'.',
        ]);
    }

    private function sincronizarHttp(Veiculo $veiculo): RastreadorEvento
    {
        $strUrl = rtrim((string) config('rastreador.api_url'), '/');
        $strKey = (string) config('rastreador.api_key', '');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$strKey,
                'Accept' => 'application/json',
            ])->timeout(15)->get($strUrl.'/veiculos/'.$veiculo->id.'/status');

            $strDetalhes = $response->successful()
                ? $response->body()
                : 'HTTP '.$response->status().': '.$response->body();

            return RastreadorEvento::create([
                'veiculo_id' => $veiculo->id,
                'tipo_evento' => 'SINCRONIZACAO',
                'origem_evento' => 'API',
                'status_comando' => $response->successful() ? 'OK' : 'ERRO',
                'detalhes' => $strDetalhes,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Rastreador API: '.$e->getMessage());

            return RastreadorEvento::create([
                'veiculo_id' => $veiculo->id,
                'tipo_evento' => 'SINCRONIZACAO',
                'origem_evento' => 'API',
                'status_comando' => 'ERRO',
                'detalhes' => $e->getMessage(),
            ]);
        }
    }
}

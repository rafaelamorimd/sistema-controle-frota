<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class FulltrackService
{
    private function obterHeaders(): array
    {
        $strApiKey = (string) config('rastreador.fulltrack.api_key', '');
        $strSecretKey = (string) config('rastreador.fulltrack.secret_key', '');

        return [
            'SECRETKEY' => $strSecretKey,
            'APIKEY' => $strApiKey,
            'Accept' => 'application/json',
        ];
    }

    private function obterBaseUrl(): string
    {
        return rtrim((string) config('rastreador.fulltrack.base_url', 'https://ws.fulltrack2.com'), '/');
    }

    /**
     * @return array<int|string, mixed>
     */
    private function getJson(string $strPath): array
    {
        $strUrl = $this->obterBaseUrl().$strPath;

        try {
            $response = Http::withHeaders($this->obterHeaders())
                ->timeout(20)
                ->retry(2, 200)
                ->get($strUrl);
        } catch (\Throwable $e) {
            Log::warning('Fulltrack API: '.$e->getMessage());
            throw new RuntimeException('Falha de conexao com a API Fulltrack.', 0, $e);
        }

        if (! $response->successful()) {
            Log::warning('Fulltrack API HTTP '.$response->status().': '.$response->body());
            throw new RuntimeException('Erro HTTP '.$response->status().' na API Fulltrack.');
        }

        $arrJson = $response->json();

        if (! is_array($arrJson)) {
            throw new RuntimeException('Resposta invalida da API Fulltrack.');
        }

        if (array_key_exists('status', $arrJson) && $arrJson['status'] === false) {
            $strMsg = is_string($arrJson['message'] ?? null) ? $arrJson['message'] : 'Erro na API Fulltrack.';
            throw new RuntimeException($strMsg);
        }

        $mixData = $arrJson['data'] ?? null;

        return is_array($mixData) ? $mixData : [];
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarVeiculos(): array
    {
        return $this->getJson('/vehicles/all');
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarEventosTodos(): array
    {
        return $this->getJson('/events/all');
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarEventosPaginados(int $numPagina = 1): array
    {
        $strQuery = $numPagina > 1 ? '?page='.$numPagina : '';

        return $this->getJson('/events/pagination'.$strQuery);
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarEventoVeiculo(string $strIdVeiculo): array
    {
        return $this->getJson('/events/single/id/'.$strIdVeiculo);
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarEventosIntervalo(string $strIdVeiculo, string $strInicio, string $strFim): array
    {
        return $this->getJson('/events/interval/id/'.$strIdVeiculo.'/begin/'.$strInicio.'/end/'.$strFim);
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarAlertasTodos(): array
    {
        return $this->getJson('/alerts/all');
    }

    /**
     * @return array<int|string, mixed>
     */
    public function buscarAlertasPeriodo(string $strInicio, string $strFim): array
    {
        return $this->getJson('/alerts/period/initial/'.$strInicio.'/final/'.$strFim);
    }
}

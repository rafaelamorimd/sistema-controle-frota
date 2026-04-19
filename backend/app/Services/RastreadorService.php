<?php

namespace App\Services;

use App\Enums\StatusContrato;
use App\Models\RastreadorEvento;
use App\Models\Veiculo;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RastreadorService
{
    public function __construct(private FulltrackService $fulltrackService) {}

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
        if ($this->bolFulltrackDisponivel()) {
            return $this->sincronizarFulltrack($veiculo);
        }

        $strDriver = config('rastreador.driver', 'stub');

        if ($strDriver === 'http' && config('rastreador.api_url')) {
            return $this->sincronizarHttp($veiculo);
        }

        return $this->sincronizarStub($veiculo);
    }

    /**
     * @return array{vinculados: int, sem_match: int, erros: int}
     */
    public function sincronizarVinculosEmLote(): array
    {
        $arrResultado = ['vinculados' => 0, 'sem_match' => 0, 'erros' => 0];

        if (! $this->bolFulltrackDisponivel()) {
            return $arrResultado;
        }

        try {
            $arrRaw = $this->fulltrackService->buscarVeiculos();
        } catch (\Throwable $e) {
            Log::warning('Rastreador vinculo em lote: '.$e->getMessage());

            return $arrResultado;
        }

        foreach (Veiculo::query()->whereNull('veiculo_id_externo')->get() as $objVeiculo) {
            $strPlacaLocal = $this->normalizarPlaca($objVeiculo->placa);
            $strIdFt = null;
            foreach ($arrRaw as $arrLinha) {
                if (! is_array($arrLinha)) {
                    continue;
                }
                if ($this->normalizarPlaca((string) ($arrLinha['ras_vei_placa'] ?? '')) === $strPlacaLocal) {
                    $strIdFt = (string) ($arrLinha['ras_vei_id'] ?? '');
                    break;
                }
            }
            if ($strIdFt === null || $strIdFt === '') {
                $arrResultado['sem_match']++;

                continue;
            }
            try {
                $objVeiculo->update(['veiculo_id_externo' => $strIdFt]);
                $arrResultado['vinculados']++;
            } catch (QueryException $e) {
                Log::warning('veiculo_id_externo lote: '.$e->getMessage());
                $arrResultado['erros']++;
            }
        }

        return $arrResultado;
    }

    public function atualizarVinculoExterno(Veiculo $veiculo, ?string $strIdExterno): Veiculo
    {
        $veiculo->veiculo_id_externo = $strIdExterno;
        $veiculo->save();

        return $veiculo->fresh();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarPosicaoTodos(?string $strFiltroIgnicao = null): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarEventosTodos();
        $arrLista = $this->normalizarListaEventos($arrRaw);
        $arrEnriquecido = $this->enriquecerPosicoes($arrLista);

        if ($strFiltroIgnicao === null || $strFiltroIgnicao === '') {
            return $arrEnriquecido;
        }

        return array_values(array_filter($arrEnriquecido, function (array $arrLinha) use ($strFiltroIgnicao): bool {
            $strIgn = (string) ($arrLinha['ras_eve_ignicao'] ?? '');

            return $strIgn === $strFiltroIgnicao;
        }));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarPosicaoVeiculo(string $strIdVeiculo): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarEventoVeiculo($strIdVeiculo);
        $arrLista = $this->normalizarListaEventos($arrRaw);

        return $this->enriquecerPosicoes($arrLista);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarHistoricoPosicoes(string $strIdVeiculo, string $strInicio, string $strFim): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarEventosIntervalo($strIdVeiculo, $strInicio, $strFim);
        $arrLista = $this->normalizarListaEventos($arrRaw);

        return $this->enriquecerPosicoes($arrLista);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarVeiculosFulltrack(): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarVeiculos();

        $arrPlacas = [];
        foreach ($arrRaw as $arrLinha) {
            if (! is_array($arrLinha)) {
                continue;
            }
            $arrPlacas[] = (string) ($arrLinha['ras_vei_placa'] ?? '');
        }

        $objMapa = $this->obterMapaVeiculosPorPlacas($arrPlacas);

        $arrSaida = [];
        foreach ($arrRaw as $arrLinha) {
            if (! is_array($arrLinha)) {
                continue;
            }
            $strPlacaNorm = $this->normalizarPlaca((string) ($arrLinha['ras_vei_placa'] ?? ''));
            $objV = $strPlacaNorm !== '' ? $objMapa->get($strPlacaNorm) : null;
            $arrSaida[] = array_merge($arrLinha, [
                'veiculo_id' => $objV?->id,
                'veiculo_status' => $objV?->status?->value,
                'veiculo_modelo' => $objV?->modelo,
                'contrato_ativo' => $objV !== null && $objV->contratos->isNotEmpty(),
            ]);
        }

        return $arrSaida;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarAlertasAbertos(): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarAlertasTodos();

        return $this->enriquecerAlertas($arrRaw);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buscarAlertasPeriodo(string $strInicio, string $strFim): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }

        $arrRaw = $this->fulltrackService->buscarAlertasPeriodo($strInicio, $strFim);

        return $this->enriquecerAlertas($arrRaw);
    }

    /**
     * @return array<string, mixed>
     */
    public function resumoParaDashboard(): array
    {
        $arrVazio = [
            'posicoes' => [],
            'rastreador_total_gps' => 0,
            'rastreador_ignicao_ligada' => 0,
            'rastreador_ignicao_desligada' => 0,
            'rastreador_alertas_gps' => 0,
        ];

        if (! $this->bolFulltrackDisponivel()) {
            return $arrVazio;
        }

        try {
            $arrPosicoes = $this->buscarPosicaoTodos();
            $numLigada = 0;
            $numDesligada = 0;
            foreach ($arrPosicoes as $arrLinha) {
                $strIgn = (string) ($arrLinha['ras_eve_ignicao'] ?? '');
                if ($strIgn === '1') {
                    $numLigada++;
                } elseif ($strIgn === '0') {
                    $numDesligada++;
                }
            }
            $arrAlertas = $this->buscarAlertasAbertos();

            return [
                'posicoes' => $arrPosicoes,
                'rastreador_total_gps' => count($arrPosicoes),
                'rastreador_ignicao_ligada' => $numLigada,
                'rastreador_ignicao_desligada' => $numDesligada,
                'rastreador_alertas_gps' => count($arrAlertas),
            ];
        } catch (\Throwable $e) {
            Log::warning('Rastreador resumo dashboard: '.$e->getMessage());

            return $arrVazio;
        }
    }

    private function bolFulltrackDisponivel(): bool
    {
        if (config('rastreador.driver') !== 'fulltrack') {
            return false;
        }
        $strKey = (string) config('rastreador.fulltrack.api_key', '');
        $strSecret = (string) config('rastreador.fulltrack.secret_key', '');

        return $strKey !== '' && $strSecret !== '';
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

    private function sincronizarFulltrack(Veiculo $veiculo): RastreadorEvento
    {
        try {
            $veiculo->refresh();
            $arrMatch = null;

            $strIdSalvo = $veiculo->veiculo_id_externo;
            if ($strIdSalvo !== null && $strIdSalvo !== '') {
                $arrRaw = $this->fulltrackService->buscarEventoVeiculo((string) $strIdSalvo);
                $arrLista = $this->normalizarListaEventos($arrRaw);
                $arrMatch = $arrLista[0] ?? null;
            }

            if ($arrMatch === null) {
                $arrTodos = $this->fulltrackService->buscarEventosTodos();
                $arrLista = $this->normalizarListaEventos($arrTodos);
                $strPlacaLocal = $this->normalizarPlaca($veiculo->placa);
                foreach ($arrLista as $arrLinha) {
                    if (! is_array($arrLinha)) {
                        continue;
                    }
                    if ($this->normalizarPlaca((string) ($arrLinha['ras_vei_placa'] ?? '')) === $strPlacaLocal) {
                        $arrMatch = $arrLinha;
                        break;
                    }
                }
            }

            if ($arrMatch === null) {
                return RastreadorEvento::create([
                    'veiculo_id' => $veiculo->id,
                    'tipo_evento' => 'SINCRONIZACAO',
                    'origem_evento' => 'FULLTRACK',
                    'status_comando' => 'ERRO',
                    'detalhes' => 'Veiculo nao encontrado na Fulltrack (placa '.$veiculo->placa.').',
                ]);
            }

            $strNovoId = (string) ($arrMatch['ras_vei_id'] ?? '');
            if ($strNovoId !== '' && ($veiculo->veiculo_id_externo === null || $veiculo->veiculo_id_externo === '')) {
                try {
                    $veiculo->update(['veiculo_id_externo' => $strNovoId]);
                    $veiculo->refresh();
                } catch (QueryException $e) {
                    Log::warning('veiculo_id_externo sync: '.$e->getMessage());
                }
            }

            $numHodometro = $this->extrairHodometroFulltrack($arrMatch);
            if ($numHodometro !== null) {
                $veiculo->refresh();
                $veiculo->update([
                    'km_rastreador' => $numHodometro,
                    'dth_ultimo_km_rastreador' => now(),
                    'km_atual' => max((int) $veiculo->km_atual, $numHodometro),
                ]);
            }

            $strJson = json_encode($arrMatch, JSON_UNESCAPED_UNICODE);

            return RastreadorEvento::create([
                'veiculo_id' => $veiculo->id,
                'tipo_evento' => 'SINCRONIZACAO',
                'origem_evento' => 'FULLTRACK',
                'status_comando' => 'OK',
                'detalhes' => $strJson !== false ? $strJson : 'OK',
            ]);
        } catch (\Throwable $e) {
            Log::warning('Rastreador Fulltrack sync: '.$e->getMessage());

            return RastreadorEvento::create([
                'veiculo_id' => $veiculo->id,
                'tipo_evento' => 'SINCRONIZACAO',
                'origem_evento' => 'FULLTRACK',
                'status_comando' => 'ERRO',
                'detalhes' => $e->getMessage(),
            ]);
        }
    }

    private function normalizarPlaca(string $strPlaca): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $strPlaca));
    }

    /**
     * Eventos Fulltrack: tenta ras_eve_hodometro, ras_eve_odometro, ras_eve_km (confirmar no JSON do provedor).
     *
     * @param  array<string, mixed>  $arrMatch
     */
    private function extrairHodometroFulltrack(array $arrMatch): ?int
    {
        $arrChavesHodometro = ['ras_eve_hodometro', 'ras_eve_odometro', 'ras_eve_km'];
        foreach ($arrChavesHodometro as $strChave) {
            if (! array_key_exists($strChave, $arrMatch)) {
                continue;
            }
            $mixValor = $arrMatch[$strChave];
            if ($mixValor === null || $mixValor === '') {
                continue;
            }
            if (is_numeric($mixValor)) {
                $num = (int) $mixValor;
            } else {
                $strDigits = preg_replace('/\D/', '', (string) $mixValor);
                $num = $strDigits !== '' ? (int) $strDigits : -1;
            }
            if ($num >= 0) {
                return $num;
            }
        }

        return null;
    }

    /**
     * @param  array<int, string>  $arrIdsExternos
     * @return Collection<string, Veiculo>
     */
    private function obterMapaVeiculosPorIdsExternos(array $arrIdsExternos): Collection
    {
        $arrIds = array_unique(array_filter(array_map(fn (string $str): string => trim($str), $arrIdsExternos)));
        if ($arrIds === []) {
            return collect();
        }

        return Veiculo::query()
            ->with(['contratos' => function ($query): void {
                $query->where('status', StatusContrato::ATIVO);
            }])
            ->whereIn('veiculo_id_externo', $arrIds)
            ->get()
            ->keyBy(fn (Veiculo $objV): string => (string) $objV->veiculo_id_externo);
    }

    /**
     * @param  array<int, string>  $arrPlacas
     * @return Collection<string, Veiculo>
     */
    private function obterMapaVeiculosPorPlacas(array $arrPlacas): Collection
    {
        $arrNorm = array_unique(array_filter(array_map(fn (string $strP): string => $this->normalizarPlaca($strP), $arrPlacas)));
        if ($arrNorm === []) {
            return collect();
        }

        return Veiculo::query()
            ->with(['contratos' => function ($query): void {
                $query->where('status', StatusContrato::ATIVO);
            }])
            ->get()
            ->keyBy(fn (Veiculo $objV): string => $this->normalizarPlaca($objV->placa));
    }

    /**
     * @param  array<int, mixed>  $arrRaw
     * @return array<int, array<string, mixed>>
     */
    private function normalizarListaEventos(array $arrRaw): array
    {
        if (isset($arrRaw['events']) && is_array($arrRaw['events'])) {
            $arrInner = $arrRaw['events'];
        } else {
            $arrInner = $arrRaw;
        }

        $arrSaida = [];
        foreach ($arrInner as $mixLinha) {
            if (is_array($mixLinha)) {
                $arrSaida[] = $mixLinha;
            }
        }

        return $arrSaida;
    }

    /**
     * @param  array<int, array<string, mixed>>  $arrLista
     * @return array<int, array<string, mixed>>
     */
    private function enriquecerPosicoes(array $arrLista): array
    {
        $arrIdsExternos = [];
        $arrPlacas = [];
        foreach ($arrLista as $arrLinha) {
            $strFtId = (string) ($arrLinha['ras_vei_id'] ?? '');
            if ($strFtId !== '') {
                $arrIdsExternos[] = $strFtId;
            }
            $arrPlacas[] = (string) ($arrLinha['ras_vei_placa'] ?? '');
        }
        $objMapaId = $this->obterMapaVeiculosPorIdsExternos($arrIdsExternos);
        $objMapaPlaca = $this->obterMapaVeiculosPorPlacas($arrPlacas);

        $arrSaida = [];
        foreach ($arrLista as $arrLinha) {
            $strFtId = (string) ($arrLinha['ras_vei_id'] ?? '');
            $objV = null;
            if ($strFtId !== '') {
                $objV = $objMapaId->get($strFtId);
            }
            if ($objV === null) {
                $strPlacaNorm = $this->normalizarPlaca((string) ($arrLinha['ras_vei_placa'] ?? ''));
                $objV = $strPlacaNorm !== '' ? $objMapaPlaca->get($strPlacaNorm) : null;
            }
            $arrSaida[] = array_merge($arrLinha, [
                'veiculo_id' => $objV?->id,
                'veiculo_modelo' => $objV?->modelo,
                'veiculo_status' => $objV?->status?->value,
                'contrato_ativo' => $objV !== null && $objV->contratos->isNotEmpty(),
            ]);
        }

        return $arrSaida;
    }

    /**
     * @param  array<int, array<string, mixed>>  $arrAlertas
     * @return array<int, array<string, mixed>>
     */
    private function enriquecerAlertas(array $arrAlertas): array
    {
        $arrIdsExternos = [];
        foreach ($arrAlertas as $arrLinha) {
            $arrIdsExternos[] = (string) ($arrLinha['ras_eal_id_veiculo'] ?? '');
        }
        $objMapaId = $this->obterMapaVeiculosPorIdsExternos($arrIdsExternos);
        $arrMapaFt = $this->obterMapaIdVeiculoFulltrackParaPlaca();

        $arrPlacasFallback = [];
        foreach ($arrAlertas as $arrLinha) {
            $strIdV = (string) ($arrLinha['ras_eal_id_veiculo'] ?? '');
            $objV = $strIdV !== '' ? $objMapaId->get($strIdV) : null;
            if ($objV === null) {
                $strPlaca = $arrMapaFt[$strIdV] ?? (string) ($arrLinha['ras_vei_placa'] ?? '');
                $arrPlacasFallback[] = $strPlaca;
            }
        }
        $objMapaPlaca = $this->obterMapaVeiculosPorPlacas($arrPlacasFallback);

        $arrSaida = [];
        foreach ($arrAlertas as $arrLinha) {
            $strIdV = (string) ($arrLinha['ras_eal_id_veiculo'] ?? '');
            $objV = $strIdV !== '' ? $objMapaId->get($strIdV) : null;
            if ($objV === null) {
                $strPlaca = $arrMapaFt[$strIdV] ?? (string) ($arrLinha['ras_vei_placa'] ?? '');
                $strPlacaNorm = $this->normalizarPlaca($strPlaca);
                $objV = $strPlacaNorm !== '' ? $objMapaPlaca->get($strPlacaNorm) : null;
            }
            $strPlacaExibicao = $arrMapaFt[$strIdV] ?? (string) ($arrLinha['ras_vei_placa'] ?? '');
            $arrSaida[] = array_merge($arrLinha, [
                'veiculo_placa' => $strPlacaExibicao !== '' ? $strPlacaExibicao : null,
                'veiculo_id' => $objV?->id,
                'contrato_ativo' => $objV !== null && $objV->contratos->isNotEmpty(),
            ]);
        }

        return $arrSaida;
    }

    /**
     * @return array<string, string>
     */
    private function obterMapaIdVeiculoFulltrackParaPlaca(): array
    {
        if (! $this->bolFulltrackDisponivel()) {
            return [];
        }
        try {
            $arrRaw = $this->fulltrackService->buscarVeiculos();
        } catch (\Throwable $e) {
            Log::warning('Fulltrack veiculos para alertas: '.$e->getMessage());

            return [];
        }
        $arrMapa = [];
        foreach ($arrRaw as $arrLinha) {
            if (! is_array($arrLinha)) {
                continue;
            }
            $strId = (string) ($arrLinha['ras_vei_id'] ?? '');
            $strPlaca = (string) ($arrLinha['ras_vei_placa'] ?? '');
            if ($strId !== '') {
                $arrMapa[$strId] = $strPlaca;
            }
        }

        return $arrMapa;
    }
}

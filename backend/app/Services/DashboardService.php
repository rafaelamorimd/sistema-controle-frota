<?php

namespace App\Services;

use App\Enums\StatusCondutor;
use App\Enums\StatusContrato;
use App\Enums\StatusDespesa;
use App\Enums\StatusPagamento;
use App\Enums\StatusVeiculo;
use App\Models\Alerta;
use App\Models\Condutor;
use App\Models\Contrato;
use App\Models\Despesa;
use App\Models\Pagamento;
use App\Models\Veiculo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    public function __construct(private RastreadorService $rastreadorService) {}

    public function resumo(): array
    {
        $arrFin = $this->rendaLiquida(null, null);

        $arr = [
            'veiculos_total' => Veiculo::count(),
            'veiculos_alugados' => Veiculo::where('status', StatusVeiculo::ALUGADO)->count(),
            'condutores_ativos' => Condutor::where('status', StatusCondutor::ATIVO)->count(),
            'contratos_ativos' => Contrato::where('status', StatusContrato::ATIVO)->count(),
            'alertas_ativos' => Alerta::ativos()->count(),
            'pagamentos_atrasados' => Pagamento::where('status', StatusPagamento::ATRASADO)->count(),
            'receitas_mes_atual' => $arrFin['receitas_pagas'],
            'despesas_mes_atual' => $arrFin['despesas_pagas'],
            'renda_liquida_mes_atual' => $arrFin['renda_liquida'],
        ];

        try {
            $arrFt = $this->rastreadorService->resumoParaDashboard();
            $arr['rastreador_total_gps'] = $arrFt['rastreador_total_gps'];
            $arr['rastreador_ignicao_ligada'] = $arrFt['rastreador_ignicao_ligada'];
            $arr['rastreador_ignicao_desligada'] = $arrFt['rastreador_ignicao_desligada'];
            $arr['rastreador_alertas_gps'] = $arrFt['rastreador_alertas_gps'];
            $arr['rastreador_posicoes'] = $arrFt['posicoes'];
        } catch (\Throwable $e) {
            Log::warning('Dashboard resumo Fulltrack: '.$e->getMessage());
            $arr['rastreador_total_gps'] = 0;
            $arr['rastreador_ignicao_ligada'] = 0;
            $arr['rastreador_ignicao_desligada'] = 0;
            $arr['rastreador_alertas_gps'] = 0;
            $arr['rastreador_posicoes'] = [];
        }

        return $arr;
    }

    public function rendaLiquida(?string $strMes = null, ?int $numVeiculoId = null): array
    {
        $dthMes = $strMes
            ? Carbon::createFromFormat('Y-m', $strMes)->startOfMonth()
            : now()->startOfMonth();

        $dthInicio = $dthMes->copy()->startOfMonth();
        $dthFim = $dthMes->copy()->endOfMonth();

        $queryReceitas = Pagamento::query()
            ->where('status', StatusPagamento::PAGO)
            ->whereNotNull('data_pagamento')
            ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()]);

        $queryDespesas = Despesa::query()
            ->where('status', StatusDespesa::PAGO)
            ->whereNotNull('data_pagamento')
            ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()]);

        if ($numVeiculoId !== null) {
            $queryReceitas->where('veiculo_id', $numVeiculoId);
            $queryDespesas->where('veiculo_id', $numVeiculoId);
        }

        $numReceitas = (float) $queryReceitas->sum('valor');
        $numDespesas = (float) $queryDespesas->sum('valor');

        $arrPorVeiculo = [];

        if ($numVeiculoId === null) {
            $arrReceitasPorVeiculo = Pagamento::query()
                ->select('veiculo_id', DB::raw('SUM(valor) as total'))
                ->where('status', StatusPagamento::PAGO)
                ->whereNotNull('data_pagamento')
                ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()])
                ->groupBy('veiculo_id')
                ->pluck('total', 'veiculo_id');

            $arrDespesasPorVeiculo = Despesa::query()
                ->select('veiculo_id', DB::raw('SUM(valor) as total'))
                ->where('status', StatusDespesa::PAGO)
                ->whereNotNull('data_pagamento')
                ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()])
                ->groupBy('veiculo_id')
                ->pluck('total', 'veiculo_id');

            $arrIds = $arrReceitasPorVeiculo->keys()->merge($arrDespesasPorVeiculo->keys())->unique();

            foreach ($arrIds as $id) {
                $numR = (float) ($arrReceitasPorVeiculo[$id] ?? 0);
                $numD = (float) ($arrDespesasPorVeiculo[$id] ?? 0);
                $arrPorVeiculo[] = [
                    'veiculo_id' => (int) $id,
                    'receitas_pagas' => $numR,
                    'despesas_pagas' => $numD,
                    'renda_liquida' => $numR - $numD,
                ];
            }
        }

        return [
            'mes_referencia' => $dthInicio->format('Y-m'),
            'receitas_pagas' => $numReceitas,
            'despesas_pagas' => $numDespesas,
            'renda_liquida' => $numReceitas - $numDespesas,
            'por_veiculo' => $arrPorVeiculo,
        ];
    }

    public function alertasDashboard(int $numLimite = 20): array
    {
        $query = Alerta::ativos()->orderByDesc('created_at')->limit($numLimite);

        return [
            'total_ativos' => Alerta::ativos()->count(),
            'itens' => $query->get(),
        ];
    }
}

<?php

namespace App\Services;

use App\Enums\StatusDespesa;
use App\Models\Despesa;
use App\Models\Veiculo;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class DespesaService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Despesa::with('veiculo');

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (!empty($filtros['categoria'])) {
            $query->where('categoria', $filtros['categoria']);
        }
        if (!empty($filtros['mes'])) {
            $dthMes = Carbon::createFromFormat('Y-m', $filtros['mes'])->startOfMonth();
            $query->whereYear('data_pagamento', $dthMes->year)
                ->whereMonth('data_pagamento', $dthMes->month);
        }

        return $query->orderByDesc('created_at')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        $query = $veiculo->despesas();

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        return $query->orderByDesc('created_at')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): Despesa
    {
        if (empty($dados['status'])) {
            $dados['status'] = StatusDespesa::PENDENTE;
        }

        return Despesa::create($dados)->load('veiculo');
    }

    public function atualizar(Despesa $despesa, array $dados): Despesa
    {
        $despesa->update($dados);

        return $despesa->fresh('veiculo');
    }

    public function marcarPago(Despesa $despesa): Despesa
    {
        $despesa->update([
            'status' => StatusDespesa::PAGO,
            'data_pagamento' => now()->toDateString(),
        ]);

        return $despesa->fresh('veiculo');
    }

    public function lancarDespesasRastreadorMensal(): int
    {
        $numCriadas = 0;

        $arrVeiculos = Veiculo::query()
            ->where('rastreador_ativo', true)
            ->where('valor_rastreador', '>', 0)
            ->get();

        foreach ($arrVeiculos as $objVeiculo) {
            $bolExiste = Despesa::query()
                ->where('veiculo_id', $objVeiculo->id)
                ->where('categoria', 'RASTREADOR')
                ->whereYear('data_vencimento', now()->year)
                ->whereMonth('data_vencimento', now()->month)
                ->exists();

            if ($bolExiste) {
                continue;
            }

            Despesa::create([
                'veiculo_id' => $objVeiculo->id,
                'descricao' => 'Mensalidade rastreador '.$objVeiculo->placa,
                'categoria' => 'RASTREADOR',
                'valor' => $objVeiculo->valor_rastreador,
                'data_vencimento' => now()->endOfMonth()->toDateString(),
                'status' => StatusDespesa::PENDENTE,
            ]);
            $numCriadas++;
        }

        return $numCriadas;
    }
}

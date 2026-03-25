<?php

namespace App\Services;

use App\Enums\TipoMovimentacaoPeca;
use App\Models\MovimentacaoPeca;
use App\Models\Peca;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PecaService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Peca::query();

        if (!empty($filtros['busca'])) {
            $str = '%'.$filtros['busca'].'%';
            $query->where(function ($q) use ($str) {
                $q->where('nome', 'ilike', $str)
                    ->orWhere('codigo', 'ilike', $str);
            });
        }
        if (!empty($filtros['categoria'])) {
            $query->where('categoria', $filtros['categoria']);
        }
        if (!empty($filtros['estoque_baixo']) && filter_var($filtros['estoque_baixo'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNotNull('estoque_minimo')
                ->whereColumn('quantidade_estoque', '<=', 'estoque_minimo');
        }

        return $query->orderBy('nome')->paginate($filtros['por_pagina'] ?? 30);
    }

    public function criar(array $dados): Peca
    {
        return Peca::create($dados);
    }

    public function atualizar(Peca $peca, array $dados): Peca
    {
        $peca->update($dados);

        return $peca->fresh();
    }

    public function excluir(Peca $peca): void
    {
        $peca->delete();
    }

    public function registrarMovimentacao(
        Peca $peca,
        TipoMovimentacaoPeca $tipo,
        int $numQuantidade,
        ?float $numCustoUnitario,
        ?int $numManutencaoId,
        ?int $numVeiculoId,
        ?string $strObservacao
    ): MovimentacaoPeca {
        return DB::transaction(function () use ($peca, $tipo, $numQuantidade, $numCustoUnitario, $numManutencaoId, $numVeiculoId, $strObservacao) {
            if ($tipo === TipoMovimentacaoPeca::SAIDA) {
                if ($peca->quantidade_estoque < $numQuantidade) {
                    throw new \InvalidArgumentException('Estoque insuficiente para a peca '.$peca->nome.'.');
                }
                $peca->quantidade_estoque -= $numQuantidade;
            } else {
                $peca->quantidade_estoque += $numQuantidade;
                if ($numCustoUnitario !== null && $numCustoUnitario > 0) {
                    $numAtual = (float) ($peca->custo_medio ?? 0);
                    $numQAntes = $peca->quantidade_estoque - $numQuantidade;
                    if ($numQAntes <= 0) {
                        $peca->custo_medio = $numCustoUnitario;
                    } else {
                        $numTotalAntes = $numQAntes * $numAtual;
                        $numTotalNovo = $numQuantidade * $numCustoUnitario;
                        $peca->custo_medio = ($numTotalAntes + $numTotalNovo) / $peca->quantidade_estoque;
                    }
                }
            }

            $peca->save();

            return MovimentacaoPeca::create([
                'peca_id' => $peca->id,
                'tipo' => $tipo,
                'quantidade' => $numQuantidade,
                'manutencao_id' => $numManutencaoId,
                'veiculo_id' => $numVeiculoId,
                'custo_unitario' => $numCustoUnitario ?? 0,
                'observacao' => $strObservacao,
            ]);
        });
    }
}

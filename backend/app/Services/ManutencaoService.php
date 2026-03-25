<?php

namespace App\Services;

use App\Enums\StatusManutencao;
use App\Enums\TipoMovimentacaoPeca;
use App\Models\Manutencao;
use App\Models\ManutencaoItem;
use App\Models\Veiculo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ManutencaoService
{
    public function __construct(private PecaService $pecaService) {}

    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Manutencao::with(['veiculo', 'itens.peca']);

        if (!empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['tipo'])) {
            $query->where('tipo', $filtros['tipo']);
        }

        return $query->orderByDesc('data_entrada')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        $filtros['veiculo_id'] = $veiculo->id;

        return $this->listar($filtros);
    }

    public function obter(Manutencao $manutencao): Manutencao
    {
        return $manutencao->load(['veiculo', 'itens.peca', 'checklistsRevisao']);
    }

    public function criar(array $dados): Manutencao
    {
        return DB::transaction(function () use ($dados) {
            $arrItens = $dados['itens'] ?? [];
            unset($dados['itens']);

            if (empty($dados['status'])) {
                $dados['status'] = StatusManutencao::EM_ANDAMENTO;
            }

            $manutencao = Manutencao::create($dados);

            foreach ($arrItens as $item) {
                $this->adicionarItemInterno($manutencao, $item);
            }

            $this->recalcularCustoTotal($manutencao->fresh());

            return $manutencao->fresh(['veiculo', 'itens.peca']);
        });
    }

    public function atualizar(Manutencao $manutencao, array $dados): Manutencao
    {
        unset($dados['itens']);
        $manutencao->update($dados);

        return $manutencao->fresh(['veiculo', 'itens.peca']);
    }

    public function excluir(Manutencao $manutencao): void
    {
        if ($manutencao->status === StatusManutencao::CONCLUIDA) {
            throw new \InvalidArgumentException('Nao e possivel excluir manutencao concluida.');
        }
        $manutencao->delete();
    }

    public function adicionarItem(Manutencao $manutencao, array $dadosItem): ManutencaoItem
    {
        if ($manutencao->status === StatusManutencao::CONCLUIDA) {
            throw new \InvalidArgumentException('Manutencao ja concluida.');
        }

        return DB::transaction(function () use ($manutencao, $dadosItem) {
            $item = $this->adicionarItemInterno($manutencao, $dadosItem);
            $this->recalcularCustoTotal($manutencao);

            return $item->load('peca');
        });
    }

    public function atualizarItem(Manutencao $manutencao, ManutencaoItem $item, array $dados): ManutencaoItem
    {
        if ($manutencao->status === StatusManutencao::CONCLUIDA) {
            throw new \InvalidArgumentException('Manutencao ja concluida.');
        }
        if ($item->manutencao_id !== $manutencao->id) {
            throw new \InvalidArgumentException('Item invalido.');
        }

        return DB::transaction(function () use ($manutencao, $item, $dados) {
            $item->update($dados);
            $this->recalcularCustoTotal($manutencao);

            return $item->fresh('peca');
        });
    }

    public function removerItem(Manutencao $manutencao, ManutencaoItem $item): void
    {
        if ($manutencao->status === StatusManutencao::CONCLUIDA) {
            throw new \InvalidArgumentException('Manutencao ja concluida.');
        }
        if ($item->manutencao_id !== $manutencao->id) {
            throw new \InvalidArgumentException('Item invalido.');
        }

        DB::transaction(function () use ($manutencao, $item) {
            $item->delete();
            $this->recalcularCustoTotal($manutencao);
        });
    }

    public function concluir(Manutencao $manutencao, ?string $dtaSaida = null): Manutencao
    {
        $manutencao->update([
            'status' => StatusManutencao::CONCLUIDA,
            'data_saida' => $dtaSaida ?? now()->toDateString(),
        ]);

        return $manutencao->fresh(['veiculo', 'itens.peca']);
    }

    private function adicionarItemInterno(Manutencao $manutencao, array $dadosItem): ManutencaoItem
    {
        $numQtd = (int) ($dadosItem['quantidade'] ?? 1);
        $numCustoUnit = (float) $dadosItem['custo_unitario'];
        $numCustoTot = (float) ($dadosItem['custo_total'] ?? ($numCustoUnit * $numQtd));

        $item = ManutencaoItem::create([
            'manutencao_id' => $manutencao->id,
            'peca_id' => $dadosItem['peca_id'] ?? null,
            'servico_realizado' => $dadosItem['servico_realizado'],
            'quantidade' => $numQtd,
            'custo_unitario' => $numCustoUnit,
            'custo_total' => $numCustoTot,
        ]);

        if (!empty($dadosItem['peca_id']) && !empty($dadosItem['baixar_estoque']) && $dadosItem['baixar_estoque']) {
            $peca = \App\Models\Peca::findOrFail($dadosItem['peca_id']);
            $this->pecaService->registrarMovimentacao(
                $peca,
                TipoMovimentacaoPeca::SAIDA,
                $numQtd,
                $numCustoUnit,
                $manutencao->id,
                $manutencao->veiculo_id,
                'Uso em manutencao #'.$manutencao->id
            );
        }

        return $item;
    }

    private function recalcularCustoTotal(Manutencao $manutencao): void
    {
        $numTotal = (float) $manutencao->itens()->sum('custo_total');
        $manutencao->update(['custo_total' => $numTotal]);
    }
}

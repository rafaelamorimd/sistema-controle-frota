<?php

namespace App\Services;

use App\Enums\StatusDespesa;
use App\Enums\StatusManutencao;
use App\Enums\TipoMovimentacaoPeca;
use App\Models\Despesa;
use App\Models\Manutencao;
use App\Models\ManutencaoItem;
use App\Models\Peca;
use App\Models\Veiculo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ManutencaoService
{
    public function __construct(private PecaService $pecaService) {}

    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Manutencao::with(['veiculo', 'itens.peca']);

        if (! empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (! empty($filtros['tipo'])) {
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

            $bolTemCustoComposto = ! empty($arrItens)
                || ((float) ($dados['valor_mao_obra'] ?? 0)) > 0.0001
                || ! empty($dados['servicos_externos']);

            if ($bolTemCustoComposto) {
                $this->recalcularCustoTotal($manutencao->fresh());
            }

            return $manutencao->fresh(['veiculo', 'itens.peca']);
        });
    }

    public function atualizar(Manutencao $manutencao, array $dados): Manutencao
    {
        unset($dados['itens']);
        $manutencao->update($dados);

        if (array_key_exists('valor_mao_obra', $dados) || array_key_exists('servicos_externos', $dados)) {
            $this->recalcularCustoTotal($manutencao->fresh());
        }

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
            $this->recalcularCustoTotal($manutencao->fresh());

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
            $this->recalcularCustoTotal($manutencao->fresh());

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
            $this->recalcularCustoTotal($manutencao->fresh());
        });
    }

    public function concluir(Manutencao $manutencao, ?string $dtaSaida = null): Manutencao
    {
        return DB::transaction(function () use ($manutencao, $dtaSaida) {
            $this->recalcularCustoTotal($manutencao->fresh());
            $manutencao->refresh();

            $strSaida = $dtaSaida ?? now()->toDateString();

            $manutencao->update([
                'status' => StatusManutencao::CONCLUIDA,
                'data_saida' => $strSaida,
            ]);

            $manutencao->refresh();

            if ((float) $manutencao->custo_total > 0) {
                Despesa::query()->updateOrCreate(
                    ['manutencao_id' => $manutencao->id],
                    [
                        'veiculo_id' => $manutencao->veiculo_id,
                        'descricao' => 'Manutencao #'.$manutencao->id.' — '.mb_substr($manutencao->descricao, 0, 200),
                        'categoria' => 'MANUTENCAO',
                        'valor' => $manutencao->custo_total,
                        'data_vencimento' => $strSaida,
                        'data_pagamento' => $strSaida,
                        'status' => StatusDespesa::PAGO,
                    ]
                );
            }

            return $manutencao->fresh(['veiculo', 'itens.peca']);
        });
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

        if (! empty($dadosItem['peca_id']) && ! empty($dadosItem['baixar_estoque']) && $dadosItem['baixar_estoque']) {
            $peca = Peca::findOrFail($dadosItem['peca_id']);
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
        $numItens = (float) $manutencao->itens()->sum('custo_total');
        $numMao = (float) ($manutencao->valor_mao_obra ?? 0);
        $numExt = 0.0;
        $arrExt = $manutencao->servicos_externos;
        if (is_array($arrExt)) {
            foreach ($arrExt as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $numExt += (float) ($row['valor'] ?? 0);
            }
        }
        $numTotal = round($numItens + $numMao + $numExt, 2);
        $manutencao->update(['custo_total' => $numTotal]);
    }
}

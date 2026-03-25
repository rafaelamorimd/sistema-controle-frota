<?php

namespace App\Services;

use App\Models\ChecklistRevisao;
use App\Models\Veiculo;
use Illuminate\Pagination\LengthAwarePaginator;

class ChecklistRevisaoService
{
    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        return $veiculo->checklistsRevisao()
            ->orderByDesc('data_revisao')
            ->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): ChecklistRevisao
    {
        return ChecklistRevisao::create($dados)->load('veiculo', 'manutencao');
    }

    public function atualizar(ChecklistRevisao $checklist, array $dados): ChecklistRevisao
    {
        $checklist->update($dados);

        return $checklist->fresh(['veiculo', 'manutencao']);
    }

    public function excluir(ChecklistRevisao $checklist): void
    {
        $checklist->delete();
    }
}

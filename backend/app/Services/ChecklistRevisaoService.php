<?php

namespace App\Services;

use App\Models\ChecklistRevisao;
use App\Models\ChecklistRevisaoFoto;
use App\Models\Veiculo;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ChecklistRevisaoService
{
    private const NUM_MAX_FOTOS_POR_CHECKLIST = 20;

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        return $veiculo->checklistsRevisao()
            ->with('fotos')
            ->orderByDesc('data_revisao')
            ->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): ChecklistRevisao
    {
        return ChecklistRevisao::create($dados)->load('veiculo', 'manutencao', 'fotos');
    }

    public function atualizar(ChecklistRevisao $checklist, array $dados): ChecklistRevisao
    {
        $checklist->update($dados);

        return $checklist->fresh(['veiculo', 'manutencao', 'fotos']);
    }

    public function excluir(ChecklistRevisao $checklist): void
    {
        $checklist->delete();
    }

    public function adicionarFoto(ChecklistRevisao $checklist, UploadedFile $arquivo): ChecklistRevisaoFoto
    {
        if ($checklist->fotos()->count() >= self::NUM_MAX_FOTOS_POR_CHECKLIST) {
            throw new \DomainException('Limite de '.self::NUM_MAX_FOTOS_POR_CHECKLIST.' fotos por checklist.');
        }

        $strCaminho = $arquivo->store("checklist-revisoes/{$checklist->id}", 'public');

        return $checklist->fotos()->create([
            'caminho_arquivo' => $strCaminho,
        ]);
    }

    public function removerFoto(ChecklistRevisaoFoto $foto): void
    {
        Storage::disk('public')->delete($foto->caminho_arquivo);
        $foto->delete();
    }
}

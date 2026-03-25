<?php

namespace App\Services;

use App\Enums\StatusMulta;
use App\Models\Multa;
use App\Models\Veiculo;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class MultaService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Multa::with(['veiculo', 'condutor', 'contrato']);

        if (!empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        return $query->orderByDesc('data_infracao')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        $filtros['veiculo_id'] = $veiculo->id;

        return $this->listar($filtros);
    }

    public function criar(array $dados, ?UploadedFile $arquivo = null): Multa
    {
        if ($arquivo) {
            $dados['caminho_comprovante'] = $arquivo->store('comprovantes/multas', 'public');
        }

        return Multa::create($dados)->load(['veiculo', 'condutor', 'contrato']);
    }

    public function atualizar(Multa $multa, array $dados, ?UploadedFile $arquivo = null): Multa
    {
        if ($arquivo) {
            if ($multa->caminho_comprovante) {
                Storage::disk('public')->delete($multa->caminho_comprovante);
            }
            $dados['caminho_comprovante'] = $arquivo->store('comprovantes/multas', 'public');
        }

        $multa->update($dados);

        return $multa->fresh(['veiculo', 'condutor', 'contrato']);
    }

    public function excluir(Multa $multa): void
    {
        if ($multa->caminho_comprovante) {
            Storage::disk('public')->delete($multa->caminho_comprovante);
        }
        $multa->delete();
    }

    public function marcarPaga(Multa $multa): Multa
    {
        $multa->update(['status' => StatusMulta::PAGA]);

        return $multa->fresh(['veiculo', 'condutor', 'contrato']);
    }
}

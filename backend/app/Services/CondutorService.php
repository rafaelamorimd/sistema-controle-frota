<?php

namespace App\Services;

use App\Models\Condutor;
use App\Models\CondutorDocumento;
use App\Models\CondutorReferencia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class CondutorService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Condutor::with(['documentos', 'referencias']);

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['busca'])) {
            $query->where(function ($q) use ($filtros) {
                $q->where('nome', 'ilike', "%{$filtros['busca']}%")
                  ->orWhere('cpf', 'like', "%{$filtros['busca']}%");
            });
        }

        return $query->orderBy('nome')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): Condutor
    {
        return Condutor::create($dados);
    }

    public function atualizar(Condutor $condutor, array $dados): Condutor
    {
        $condutor->update($dados);
        return $condutor->fresh();
    }

    public function adicionarDocumento(Condutor $condutor, string $tipo, $arquivo): CondutorDocumento
    {
        $path = $arquivo->store("condutores/{$condutor->id}/documentos", 'public');

        return $condutor->documentos()->create([
            'tipo_documento' => $tipo,
            'caminho_arquivo' => $path,
            'uploaded_at' => now(),
        ]);
    }

    public function removerDocumento(CondutorDocumento $documento): void
    {
        Storage::disk('public')->delete($documento->caminho_arquivo);
        $documento->delete();
    }

    public function adicionarReferencia(Condutor $condutor, array $dados): CondutorReferencia
    {
        return $condutor->referencias()->create($dados);
    }

    public function atualizarReferencia(CondutorReferencia $referencia, array $dados): CondutorReferencia
    {
        $referencia->update($dados);
        return $referencia->fresh();
    }
}

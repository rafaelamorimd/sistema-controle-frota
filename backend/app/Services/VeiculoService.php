<?php

namespace App\Services;

use App\Enums\StatusVeiculo;
use App\Models\Veiculo;
use Illuminate\Pagination\LengthAwarePaginator;

class VeiculoService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Veiculo::query();

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['busca'])) {
            $query->where(function ($q) use ($filtros) {
                $q->where('placa', 'ilike', "%{$filtros['busca']}%")
                  ->orWhere('modelo', 'ilike', "%{$filtros['busca']}%");
            });
        }

        return $query->orderBy('modelo')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): Veiculo
    {
        return Veiculo::create($dados);
    }

    public function atualizar(Veiculo $veiculo, array $dados): Veiculo
    {
        $veiculo->update($dados);
        return $veiculo->fresh();
    }

    public function alterarStatus(Veiculo $veiculo, StatusVeiculo $novoStatus): Veiculo
    {
        if ($novoStatus === StatusVeiculo::INATIVO) {
            $contratoAtivo = $veiculo->contratos()
                ->where('status', 'ATIVO')
                ->exists();

            if ($contratoAtivo) {
                throw new \DomainException('Veiculo possui contrato ativo. Encerre o contrato antes de inativar.');
            }
        }

        $veiculo->update(['status' => $novoStatus]);
        return $veiculo->fresh();
    }
}

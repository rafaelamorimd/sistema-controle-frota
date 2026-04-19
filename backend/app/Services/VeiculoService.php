<?php

namespace App\Services;

use App\Enums\StatusVeiculo;
use App\Models\Veiculo;
use Illuminate\Contracts\Pagination\Paginator;

class VeiculoService
{
    public function listar(array $filtros = []): Paginator
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

        return $query->orderBy('modelo')->simplePaginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): Veiculo
    {
        $numKmInicial = (int) ($dados['km_inicial'] ?? $dados['km_atual']);
        $dados['km_inicial'] = $numKmInicial;

        return Veiculo::create($dados);
    }

    public function atualizar(Veiculo $veiculo, array $dados): Veiculo
    {
        unset($dados['km_inicial']);

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

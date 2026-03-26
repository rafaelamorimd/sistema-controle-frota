<?php

namespace App\Services;

use App\Enums\StatusContrato;
use App\Enums\StatusVeiculo;
use App\Models\Contrato;
use App\Models\Veiculo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ContratoService
{
    public function __construct(
        private PagamentoService $pagamentoService,
        private RelatorioService $relatorioService
    ) {}

    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Contrato::with(['condutor', 'veiculo']);

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (!empty($filtros['condutor_id'])) {
            $query->where('condutor_id', $filtros['condutor_id']);
        }

        return $query->orderByDesc('created_at')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function criar(array $dados): Contrato
    {
        return DB::transaction(function () use ($dados) {
            $veiculoOcupado = Contrato::where('veiculo_id', $dados['veiculo_id'])
                ->where('status', StatusContrato::ATIVO)
                ->exists();

            if ($veiculoOcupado) {
                throw new \DomainException('Este veiculo ja possui um contrato ativo.');
            }

            $ultimoNumero = Contrato::max('id') ?? 0;
            $dados['numero_contrato'] = 'CTR-' . str_pad($ultimoNumero + 1, 6, '0', STR_PAD_LEFT);

            $contrato = Contrato::create($dados);

            Veiculo::where('id', $dados['veiculo_id'])
                ->update(['status' => StatusVeiculo::ALUGADO]);

            $this->pagamentoService->criarPendenteInicial($contrato);

            $strCaminhoPdf = $this->relatorioService->gerarEArmazenarPdfContrato($contrato);
            $contrato->update(['caminho_contrato_pdf' => $strCaminhoPdf]);

            return $contrato->load(['condutor', 'veiculo']);
        });
    }

    public function encerrar(Contrato $contrato, array $dados): Contrato
    {
        return DB::transaction(function () use ($contrato, $dados) {
            $contrato->update([
                'status' => StatusContrato::ENCERRADO,
                'km_final' => $dados['km_final'] ?? null,
                'motivo_encerramento' => $dados['motivo_encerramento'] ?? null,
                'data_fim' => now(),
            ]);

            Veiculo::where('id', $contrato->veiculo_id)
                ->update(['status' => StatusVeiculo::DISPONIVEL]);

            return $contrato->fresh(['condutor', 'veiculo']);
        });
    }
}

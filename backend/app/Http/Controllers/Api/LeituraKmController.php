<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeituraKmRequest;
use App\Models\Veiculo;
use App\Services\LeituraKmService;
use App\Services\PagamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeituraKmController extends Controller
{
    public function __construct(
        private LeituraKmService $service,
        private PagamentoService $pagamentoService
    ) {}

    public function index(Request $request, Veiculo $veiculo): JsonResponse
    {
        $request->validate([
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'por_pagina' => 'nullable|integer|min:1|max:100',
        ]);

        $leituras = $this->service->listarPorVeiculo($veiculo, $request->all());

        return response()->json($leituras);
    }

    public function store(LeituraKmRequest $request, Veiculo $veiculo): JsonResponse
    {
        try {
            $leitura = $this->service->registrar(
                $veiculo,
                $request->validated(),
                $request->file('foto')
            );

            return response()->json($leitura, 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function pagamentosElegiveis(Request $request, Veiculo $veiculo): JsonResponse
    {
        $request->validate([
            'por_pagina' => 'nullable|integer|min:1|max:100',
        ]);

        $pagamentos = $this->pagamentoService->listarElegiveisLeituraKmPorVeiculo($veiculo, $request->all());

        return response()->json($pagamentos);
    }
}

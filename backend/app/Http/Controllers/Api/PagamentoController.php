<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusPagamento;
use App\Http\Controllers\Controller;
use App\Http\Requests\PagamentoRegistrarRequest;
use App\Models\Contrato;
use App\Models\Pagamento;
use App\Services\PagamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PagamentoController extends Controller
{
    public function __construct(private PagamentoService $service) {}

    public function index(Request $request): JsonResponse
    {
        $pagamentos = $this->service->listar($request->all());

        return response()->json($pagamentos);
    }

    public function indexPorContrato(Request $request, Contrato $contrato): JsonResponse
    {
        $pagamentos = $this->service->listarPorContrato($contrato, $request->all());

        return response()->json($pagamentos);
    }

    public function inadimplentes(Request $request): JsonResponse
    {
        $pagamentos = $this->service->listarInadimplentes($request->all());

        return response()->json($pagamentos);
    }

    public function registrar(PagamentoRegistrarRequest $request, Pagamento $pagamento): JsonResponse
    {
        $dados = $request->validated();

        try {
            $pagamento = $this->service->registrar(
                $pagamento,
                $request->file('comprovante'),
                (float) $dados['valor'],
                StatusPagamento::from($dados['status']),
                $dados['data_pagamento'] ?? null,
                isset($dados['km']) ? (int) $dados['km'] : null
            );
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($pagamento);
    }
}

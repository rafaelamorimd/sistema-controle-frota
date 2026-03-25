<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DespesaRequest;
use App\Models\Despesa;
use App\Models\Veiculo;
use App\Services\DespesaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DespesaController extends Controller
{
    public function __construct(private DespesaService $service) {}

    public function index(Request $request): JsonResponse
    {
        $despesas = $this->service->listar($request->all());

        return response()->json($despesas);
    }

    public function indexPorVeiculo(Request $request, Veiculo $veiculo): JsonResponse
    {
        $despesas = $this->service->listarPorVeiculo($veiculo, $request->all());

        return response()->json($despesas);
    }

    public function store(DespesaRequest $request): JsonResponse
    {
        $despesa = $this->service->criar($request->validated());

        return response()->json($despesa, 201);
    }

    public function update(DespesaRequest $request, Despesa $despesa): JsonResponse
    {
        $despesa = $this->service->atualizar($despesa, $request->validated());

        return response()->json($despesa);
    }

    public function pagar(Despesa $despesa): JsonResponse
    {
        $despesa = $this->service->marcarPago($despesa);

        return response()->json($despesa);
    }
}

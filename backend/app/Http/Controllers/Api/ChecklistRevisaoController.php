<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChecklistRevisaoRequest;
use App\Models\ChecklistRevisao;
use App\Models\Veiculo;
use App\Services\ChecklistRevisaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChecklistRevisaoController extends Controller
{
    public function __construct(private ChecklistRevisaoService $service) {}

    public function indexPorVeiculo(Request $request, Veiculo $veiculo): JsonResponse
    {
        return response()->json($this->service->listarPorVeiculo($veiculo, $request->all()));
    }

    public function store(ChecklistRevisaoRequest $request): JsonResponse
    {
        $obj = $this->service->criar($request->validated());

        return response()->json($obj, 201);
    }

    public function update(ChecklistRevisaoRequest $request, ChecklistRevisao $checklistRevisao): JsonResponse
    {
        return response()->json($this->service->atualizar($checklistRevisao, $request->validated()));
    }

    public function destroy(ChecklistRevisao $checklistRevisao): JsonResponse
    {
        $this->service->excluir($checklistRevisao);

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MultaRequest;
use App\Models\Multa;
use App\Models\Veiculo;
use App\Services\MultaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MultaController extends Controller
{
    public function __construct(private MultaService $service) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->service->listar($request->all()));
    }

    public function indexPorVeiculo(Request $request, Veiculo $veiculo): JsonResponse
    {
        return response()->json($this->service->listarPorVeiculo($veiculo, $request->all()));
    }

    public function store(MultaRequest $request): JsonResponse
    {
        $dados = $request->validated();
        unset($dados['comprovante']);
        $arquivo = $request->file('comprovante');

        return response()->json($this->service->criar($dados, $arquivo), 201);
    }

    public function show(Multa $multa): JsonResponse
    {
        return response()->json($multa->load(['veiculo', 'condutor', 'contrato']));
    }

    public function update(MultaRequest $request, Multa $multa): JsonResponse
    {
        $dados = $request->validated();
        unset($dados['comprovante']);
        $arquivo = $request->file('comprovante');

        return response()->json($this->service->atualizar($multa, $dados, $arquivo));
    }

    public function destroy(Multa $multa): JsonResponse
    {
        $this->service->excluir($multa);

        return response()->json(null, 204);
    }

    public function marcarPaga(Multa $multa): JsonResponse
    {
        return response()->json($this->service->marcarPaga($multa));
    }
}

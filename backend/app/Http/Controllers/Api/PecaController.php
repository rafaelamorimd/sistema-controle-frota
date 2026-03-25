<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PecaRequest;
use App\Models\Peca;
use App\Services\PecaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PecaController extends Controller
{
    public function __construct(private PecaService $service) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->service->listar($request->all()));
    }

    public function store(PecaRequest $request): JsonResponse
    {
        $obj = $this->service->criar($request->validated());

        return response()->json($obj, 201);
    }

    public function show(Peca $peca): JsonResponse
    {
        return response()->json($peca->load('movimentacoes'));
    }

    public function update(PecaRequest $request, Peca $peca): JsonResponse
    {
        return response()->json($this->service->atualizar($peca, $request->validated()));
    }

    public function destroy(Peca $peca): JsonResponse
    {
        $this->service->excluir($peca);

        return response()->json(null, 204);
    }
}

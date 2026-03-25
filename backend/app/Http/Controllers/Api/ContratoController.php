<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContratoRequest;
use App\Models\Contrato;
use App\Services\ContratoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    public function __construct(private ContratoService $service) {}

    public function index(Request $request): JsonResponse
    {
        $contratos = $this->service->listar($request->all());
        return response()->json($contratos);
    }

    public function store(ContratoRequest $request): JsonResponse
    {
        try {
            $contrato = $this->service->criar($request->validated());
            return response()->json($contrato, 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Contrato $contrato): JsonResponse
    {
        $contrato->load(['condutor', 'veiculo', 'vistorias']);
        return response()->json($contrato);
    }

    public function update(ContratoRequest $request, Contrato $contrato): JsonResponse
    {
        $contrato->update($request->validated());
        return response()->json($contrato->fresh(['condutor', 'veiculo']));
    }

    public function encerrar(Request $request, Contrato $contrato): JsonResponse
    {
        $dados = $request->validate([
            'km_final' => 'nullable|integer|min:0',
            'motivo_encerramento' => 'nullable|string',
        ]);

        try {
            $contrato = $this->service->encerrar($contrato, $dados);
            return response()->json($contrato);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

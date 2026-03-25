<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VeiculoRequest;
use App\Models\Veiculo;
use App\Enums\StatusVeiculo;
use App\Services\VeiculoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VeiculoController extends Controller
{
    public function __construct(private VeiculoService $service) {}

    public function index(Request $request): JsonResponse
    {
        $veiculos = $this->service->listar($request->all());
        return response()->json($veiculos);
    }

    public function store(VeiculoRequest $request): JsonResponse
    {
        $veiculo = $this->service->criar($request->validated());
        return response()->json($veiculo, 201);
    }

    public function show(Veiculo $veiculo): JsonResponse
    {
        return response()->json($veiculo);
    }

    public function update(VeiculoRequest $request, Veiculo $veiculo): JsonResponse
    {
        $veiculo = $this->service->atualizar($veiculo, $request->validated());
        return response()->json($veiculo);
    }

    public function alterarStatus(Request $request, Veiculo $veiculo): JsonResponse
    {
        $request->validate(['status' => 'required|string|in:DISPONIVEL,ALUGADO,MANUTENCAO,INATIVO']);

        try {
            $veiculo = $this->service->alterarStatus($veiculo, StatusVeiculo::from($request->status));
            return response()->json($veiculo);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

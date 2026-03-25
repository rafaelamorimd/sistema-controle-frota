<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function resumo(): JsonResponse
    {
        return response()->json($this->service->resumo());
    }

    public function rendaLiquida(Request $request): JsonResponse
    {
        $request->validate([
            'mes' => 'nullable|date_format:Y-m',
            'veiculo_id' => 'nullable|integer|exists:veiculos,id',
        ]);

        $strMes = $request->query('mes');
        $numVeiculoId = $request->query('veiculo_id');

        $dados = $this->service->rendaLiquida(
            $strMes,
            $numVeiculoId !== null ? (int) $numVeiculoId : null
        );

        return response()->json($dados);
    }

    public function alertas(Request $request): JsonResponse
    {
        $numLimite = (int) ($request->query('limite', 20));

        return response()->json($this->service->alertasDashboard($numLimite));
    }
}

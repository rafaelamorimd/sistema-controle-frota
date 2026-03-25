<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veiculo;
use App\Services\RastreadorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RastreadorController extends Controller
{
    public function __construct(private RastreadorService $service) {}

    public function eventos(Request $request, Veiculo $veiculo): JsonResponse
    {
        $numLimite = (int) $request->query('limite', 50);

        return response()->json($this->service->listarEventos($veiculo, $numLimite));
    }

    public function sincronizar(Veiculo $veiculo): JsonResponse
    {
        $obj = $this->service->sincronizar($veiculo);

        return response()->json($obj, 201);
    }
}

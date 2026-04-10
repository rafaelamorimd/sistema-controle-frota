<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veiculo;
use App\Services\RastreadorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

    public function vinculoExterno(Request $request, Veiculo $veiculo): JsonResponse
    {
        $request->validate([
            'veiculo_id_externo' => [
                'nullable', 'string', 'max:64',
                Rule::unique('veiculos', 'veiculo_id_externo')->ignore($veiculo->id),
            ],
        ]);

        $obj = $this->service->atualizarVinculoExterno(
            $veiculo,
            $request->input('veiculo_id_externo') !== null && $request->input('veiculo_id_externo') !== ''
                ? (string) $request->input('veiculo_id_externo')
                : null
        );

        return response()->json($obj);
    }

    public function veiculosFulltrack(): JsonResponse
    {
        try {
            return response()->json($this->service->buscarVeiculosFulltrack());
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function posicoes(Request $request): JsonResponse
    {
        $request->validate([
            'ignicao' => 'nullable|in:0,1',
        ]);

        try {
            $strIgnicao = $request->query('ignicao');
            $strIgnicao = $strIgnicao !== null && $strIgnicao !== '' ? (string) $strIgnicao : null;

            return response()->json($this->service->buscarPosicaoTodos($strIgnicao));
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function posicaoVeiculo(string $strIdVeiculo): JsonResponse
    {
        try {
            return response()->json($this->service->buscarPosicaoVeiculo($strIdVeiculo));
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function historicoPosicoes(Request $request, string $strIdVeiculo): JsonResponse
    {
        $request->validate([
            'inicio' => 'required|string',
            'fim' => 'required|string',
        ]);

        try {
            return response()->json($this->service->buscarHistoricoPosicoes(
                $strIdVeiculo,
                (string) $request->query('inicio'),
                (string) $request->query('fim')
            ));
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function alertasGps(): JsonResponse
    {
        try {
            return response()->json($this->service->buscarAlertasAbertos());
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function alertasGpsPeriodo(Request $request): JsonResponse
    {
        $request->validate([
            'inicio' => 'required|string',
            'fim' => 'required|string',
        ]);

        try {
            return response()->json($this->service->buscarAlertasPeriodo(
                (string) $request->query('inicio'),
                (string) $request->query('fim')
            ));
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function resumoDashboard(): JsonResponse
    {
        return response()->json($this->service->resumoParaDashboard());
    }
}

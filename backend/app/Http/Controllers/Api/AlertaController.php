<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alerta::query();

        if ($request->boolean('apenas_ativos', true)) {
            $query->ativos();
        }

        $alertas = $query->orderByDesc('created_at')->paginate(20);
        return response()->json($alertas);
    }

    public function marcarLido(Alerta $alerta): JsonResponse
    {
        $alerta->update(['lido' => true]);
        return response()->json($alerta);
    }

    public function resolver(Alerta $alerta): JsonResponse
    {
        $alerta->update(['resolvido' => true, 'resolvido_em' => now()]);
        return response()->json($alerta);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anotacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnotacaoController extends Controller
{
    public function index(Request $request, string $entidadeTipo, int $entidadeId): JsonResponse
    {
        $anotacoes = Anotacao::where('entidade_tipo', $entidadeTipo)
            ->where('entidade_id', $entidadeId)
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($anotacoes);
    }

    public function store(Request $request, string $entidadeTipo, int $entidadeId): JsonResponse
    {
        $dados = $request->validate([
            'texto' => 'required|string',
        ]);

        $anotacao = Anotacao::create([
            'entidade_tipo' => $entidadeTipo,
            'entidade_id' => $entidadeId,
            'texto' => $dados['texto'],
            'user_id' => $request->user()->id,
        ]);

        return response()->json($anotacao->load('user'), 201);
    }
}

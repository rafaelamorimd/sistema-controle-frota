<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConfiguracaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracaoController extends Controller
{
    public function __construct(
        private ConfiguracaoService $configuracaoService
    ) {}

    public function index(): JsonResponse
    {
        $arrMapa = $this->configuracaoService->obterMap();
        return response()->json($arrMapa);
    }

    public function update(Request $request): JsonResponse
    {
        $arrDados = $request->validate([
            'locador_nome' => 'nullable|string|max:255',
            'locador_cpf' => 'nullable|string|max:14',
            'locador_endereco' => 'nullable|string|max:500',
            'locador_pix' => 'nullable|string|max:255',
            'locador_banco' => 'nullable|string|max:255',
            'locador_cidade_uf' => 'nullable|string|max:255',
        ]);

        $this->configuracaoService->salvarMap($arrDados);

        return response()->json([
            'message' => 'Configurações atualizadas com sucesso.',
        ]);
    }
}

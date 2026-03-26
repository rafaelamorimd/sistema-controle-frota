<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MovimentacaoPecaRequest;
use App\Models\Peca;
use App\Enums\TipoMovimentacaoPeca;
use App\Services\PecaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovimentacaoPecaController extends Controller
{
    public function __construct(private PecaService $service) {}

    public function index(Request $request, Peca $peca): JsonResponse
    {
        $arrMovimentacoes = $this->service->listarMovimentacoes($peca, $request->all());

        return response()->json($arrMovimentacoes);
    }

    public function store(MovimentacaoPecaRequest $request, Peca $peca): JsonResponse
    {
        $dados = $request->validated();

        $obj = $this->service->registrarMovimentacao(
            $peca,
            TipoMovimentacaoPeca::from($dados['tipo']),
            (int) $dados['quantidade'],
            isset($dados['custo_unitario']) ? (float) $dados['custo_unitario'] : null,
            isset($dados['manutencao_id']) ? (int) $dados['manutencao_id'] : null,
            isset($dados['veiculo_id']) ? (int) $dados['veiculo_id'] : null,
            $dados['observacao'] ?? null
        );

        return response()->json($obj->load('peca'), 201);
    }
}

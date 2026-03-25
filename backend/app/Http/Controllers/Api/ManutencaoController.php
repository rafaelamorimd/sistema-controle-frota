<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManutencaoItemRequest;
use App\Http\Requests\ManutencaoRequest;
use App\Models\Manutencao;
use App\Models\ManutencaoItem;
use App\Services\ManutencaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManutencaoController extends Controller
{
    public function __construct(private ManutencaoService $service) {}

    public function index(Request $request): JsonResponse
    {
        $dados = $this->service->listar($request->all());

        return response()->json($dados);
    }

    public function store(ManutencaoRequest $request): JsonResponse
    {
        $obj = $this->service->criar($request->validated());

        return response()->json($obj, 201);
    }

    public function show(Manutencao $manutencao): JsonResponse
    {
        return response()->json($this->service->obter($manutencao));
    }

    public function update(ManutencaoRequest $request, Manutencao $manutencao): JsonResponse
    {
        $obj = $this->service->atualizar($manutencao, $request->validated());

        return response()->json($obj);
    }

    public function destroy(Manutencao $manutencao): JsonResponse
    {
        $this->service->excluir($manutencao);

        return response()->json(null, 204);
    }

    public function storeItem(ManutencaoItemRequest $request, Manutencao $manutencao): JsonResponse
    {
        $item = $this->service->adicionarItem($manutencao, $request->validated());

        return response()->json($item, 201);
    }

    public function updateItem(ManutencaoItemRequest $request, Manutencao $manutencao, ManutencaoItem $manutencao_item): JsonResponse
    {
        $objItem = $this->service->atualizarItem($manutencao, $manutencao_item, $request->validated());

        return response()->json($objItem);
    }

    public function destroyItem(Manutencao $manutencao, ManutencaoItem $manutencao_item): JsonResponse
    {
        $this->service->removerItem($manutencao, $manutencao_item);

        return response()->json(null, 204);
    }

    public function concluir(Request $request, Manutencao $manutencao): JsonResponse
    {
        $request->validate(['data_saida' => 'nullable|date']);
        $obj = $this->service->concluir($manutencao, $request->input('data_saida'));

        return response()->json($obj);
    }
}

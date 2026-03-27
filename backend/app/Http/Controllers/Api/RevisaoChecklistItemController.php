<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevisaoChecklistItemRequest;
use App\Models\RevisaoCategoria;
use App\Models\RevisaoChecklistItem;
use Illuminate\Http\JsonResponse;

class RevisaoChecklistItemController extends Controller
{
    public function store(RevisaoCategoria $revisao_categoria, RevisaoChecklistItemRequest $request): JsonResponse
    {
        $arrDados = $request->validated();
        $obj = $revisao_categoria->itensChecklist()->create($arrDados);

        return response()->json($obj->load('categoria'), 201);
    }

    public function update(RevisaoChecklistItemRequest $request, RevisaoChecklistItem $revisao_checklist_item): JsonResponse
    {
        $arrDados = $request->validated();
        $revisao_checklist_item->update($arrDados);

        return response()->json($revisao_checklist_item->fresh(['categoria']));
    }

    public function destroy(RevisaoChecklistItem $revisao_checklist_item): JsonResponse
    {
        $revisao_checklist_item->delete();

        return response()->json(null, 204);
    }
}

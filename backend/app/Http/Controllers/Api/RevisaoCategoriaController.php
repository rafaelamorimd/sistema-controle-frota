<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevisaoCategoriaRequest;
use App\Models\RevisaoCategoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class RevisaoCategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $arr = RevisaoCategoria::query()
            ->with(['itensChecklist' => fn ($q) => $q->orderBy('ordem')])
            ->orderBy('ordem')
            ->orderBy('nome')
            ->get();

        return response()->json($arr);
    }

    public function store(RevisaoCategoriaRequest $request): JsonResponse
    {
        $arrDados = $request->validated();
        if (empty($arrDados['slug'] ?? null)) {
            $strBase = Str::slug($arrDados['nome']);
            $strSlug = $strBase;
            $num = 1;
            while (RevisaoCategoria::where('slug', $strSlug)->exists()) {
                $strSlug = $strBase.'-'.$num++;
            }
            $arrDados['slug'] = $strSlug;
        }

        $obj = RevisaoCategoria::create($arrDados);

        return response()->json($obj->load(['itensChecklist']), 201);
    }

    public function update(RevisaoCategoriaRequest $request, RevisaoCategoria $revisao_categoria): JsonResponse
    {
        $arrDados = $request->validated();
        if (array_key_exists('slug', $arrDados) && $arrDados['slug'] === null) {
            unset($arrDados['slug']);
        }
        if (empty($arrDados['slug'] ?? null) && isset($arrDados['nome'])) {
            $strBase = Str::slug($arrDados['nome']);
            $strSlug = $strBase;
            $num = 1;
            while (RevisaoCategoria::where('slug', $strSlug)->where('id', '!=', $revisao_categoria->id)->exists()) {
                $strSlug = $strBase.'-'.$num++;
            }
            $arrDados['slug'] = $strSlug;
        }

        $revisao_categoria->update($arrDados);

        return response()->json($revisao_categoria->fresh(['itensChecklist']));
    }

    public function destroy(RevisaoCategoria $revisao_categoria): JsonResponse
    {
        $revisao_categoria->delete();

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VistoriaRequest;
use App\Models\Contrato;
use App\Models\Vistoria;
use App\Services\VistoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VistoriaController extends Controller
{
    public function __construct(private VistoriaService $service) {}

    public function index(Contrato $contrato): JsonResponse
    {
        $vistorias = $contrato->vistorias()->with(['itens', 'fotos'])->get();
        return response()->json($vistorias);
    }

    public function store(VistoriaRequest $request): JsonResponse
    {
        $vistoria = $this->service->criar($request->validated());
        return response()->json($vistoria, 201);
    }

    public function show(Vistoria $vistoria): JsonResponse
    {
        $vistoria->load(['itens', 'fotos', 'contrato', 'veiculo']);
        return response()->json($vistoria);
    }

    public function adicionarItens(Request $request, Vistoria $vistoria): JsonResponse
    {
        $dados = $request->validate([
            'itens' => 'required|array|min:1',
            'itens.*.item_verificado' => 'required|string',
            'itens.*.estado' => 'required|string|in:BOM,AVARIADO,FALTANTE',
            'itens.*.observacao' => 'nullable|string',
        ]);

        $vistoria = $this->service->adicionarItens($vistoria, $dados['itens']);
        return response()->json($vistoria);
    }

    public function uploadFoto(Request $request, Vistoria $vistoria): JsonResponse
    {
        $request->validate([
            'foto' => 'required|file|mimes:jpg,jpeg,png|max:10240',
            'vistoria_item_id' => 'nullable|exists:vistoria_itens,id',
            'descricao' => 'nullable|string|max:200',
        ]);

        $foto = $this->service->adicionarFoto(
            $vistoria,
            $request->file('foto'),
            $request->vistoria_item_id,
            $request->descricao
        );

        return response()->json($foto, 201);
    }

    public function finalizar(Vistoria $vistoria): JsonResponse
    {
        try {
            $vistoria = $this->service->finalizar($vistoria);
            return response()->json($vistoria);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

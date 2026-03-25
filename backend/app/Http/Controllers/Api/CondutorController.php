<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CondutorRequest;
use App\Models\Condutor;
use App\Models\CondutorDocumento;
use App\Services\CondutorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CondutorController extends Controller
{
    public function __construct(private CondutorService $service) {}

    public function index(Request $request): JsonResponse
    {
        $condutores = $this->service->listar($request->all());
        return response()->json($condutores);
    }

    public function store(CondutorRequest $request): JsonResponse
    {
        $condutor = $this->service->criar($request->validated());
        return response()->json($condutor, 201);
    }

    public function show(Condutor $condutor): JsonResponse
    {
        $condutor->load(['documentos', 'referencias']);
        return response()->json($condutor);
    }

    public function update(CondutorRequest $request, Condutor $condutor): JsonResponse
    {
        $condutor = $this->service->atualizar($condutor, $request->validated());
        return response()->json($condutor);
    }

    public function uploadDocumento(Request $request, Condutor $condutor): JsonResponse
    {
        $request->validate([
            'tipo_documento' => 'required|string|in:CNH_FRENTE,CNH_VERSO,COMPROVANTE_RESIDENCIA,CADASTRO_UBER,SELFIE,OUTRO',
            'arquivo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $doc = $this->service->adicionarDocumento($condutor, $request->tipo_documento, $request->file('arquivo'));
        return response()->json($doc, 201);
    }

    public function removerDocumento(Condutor $condutor, CondutorDocumento $documento): JsonResponse
    {
        $this->service->removerDocumento($documento);
        return response()->json(null, 204);
    }

    public function adicionarReferencia(Request $request, Condutor $condutor): JsonResponse
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:200',
            'telefone' => 'required|string|max:20',
            'grau_relacionamento' => 'nullable|string|max:50',
        ]);

        $ref = $this->service->adicionarReferencia($condutor, $dados);
        return response()->json($ref, 201);
    }

    public function atualizarReferencia(Request $request, Condutor $condutor, $referenciaId): JsonResponse
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:200',
            'telefone' => 'required|string|max:20',
            'grau_relacionamento' => 'nullable|string|max:50',
        ]);

        $ref = $condutor->referencias()->findOrFail($referenciaId);
        $ref = $this->service->atualizarReferencia($ref, $dados);
        return response()->json($ref);
    }
}

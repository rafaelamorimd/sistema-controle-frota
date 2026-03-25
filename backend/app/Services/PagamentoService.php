<?php

namespace App\Services;

use App\Enums\StatusContrato;
use App\Enums\StatusPagamento;
use App\Models\Contrato;
use App\Models\Pagamento;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PagamentoService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $this->marcarAtrasadosPorDataReferencia();

        $query = Pagamento::with(['contrato', 'veiculo', 'condutor']);

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (!empty($filtros['veiculo_id'])) {
            $query->where('veiculo_id', $filtros['veiculo_id']);
        }
        if (!empty($filtros['condutor_id'])) {
            $query->where('condutor_id', $filtros['condutor_id']);
        }
        if (!empty($filtros['contrato_id'])) {
            $query->where('contrato_id', $filtros['contrato_id']);
        }
        if (!empty($filtros['data_referencia_inicio'])) {
            $query->whereDate('data_referencia', '>=', $filtros['data_referencia_inicio']);
        }
        if (!empty($filtros['data_referencia_fim'])) {
            $query->whereDate('data_referencia', '<=', $filtros['data_referencia_fim']);
        }

        return $query->orderByDesc('data_referencia')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function listarPorContrato(Contrato $contrato, array $filtros = []): LengthAwarePaginator
    {
        $this->marcarAtrasadosPorDataReferencia();

        $query = $contrato->pagamentos()->with(['contrato', 'veiculo', 'condutor']);

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        return $query->orderByDesc('data_referencia')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function listarInadimplentes(array $filtros = []): LengthAwarePaginator
    {
        $this->marcarAtrasadosPorDataReferencia();

        $query = Pagamento::with(['contrato', 'veiculo', 'condutor'])
            ->where('status', '!=', StatusPagamento::PAGO)
            ->whereDate('data_referencia', '<', now()->toDateString());

        return $query->orderBy('data_referencia')->paginate($filtros['por_pagina'] ?? 15);
    }

    public function registrar(Pagamento $pagamento, UploadedFile $arquivoComprovante, float $numValor, StatusPagamento $statusPagamento): Pagamento
    {
        return DB::transaction(function () use ($pagamento, $arquivoComprovante, $numValor, $statusPagamento) {
            if ($pagamento->caminho_comprovante) {
                Storage::disk('public')->delete($pagamento->caminho_comprovante);
            }

            $strCaminho = $arquivoComprovante->store('comprovantes/pagamentos', 'public');

            $dados = [
                'valor' => $numValor,
                'status' => $statusPagamento,
                'caminho_comprovante' => $strCaminho,
            ];

            if ($statusPagamento === StatusPagamento::PAGO) {
                $dados['data_pagamento'] = now()->toDateString();
            } else {
                $dados['data_pagamento'] = null;
            }

            $pagamento->update($dados);

            return $pagamento->fresh(['contrato', 'veiculo', 'condutor']);
        });
    }

    public function marcarAtrasadosPorDataReferencia(): int
    {
        return Pagamento::query()
            ->where('status', StatusPagamento::PENDENTE)
            ->whereDate('data_referencia', '<', now()->toDateString())
            ->update(['status' => StatusPagamento::ATRASADO]);
    }

    public function criarPendenteInicial(Contrato $contrato): Pagamento
    {
        return Pagamento::create([
            'contrato_id' => $contrato->id,
            'veiculo_id' => $contrato->veiculo_id,
            'condutor_id' => $contrato->condutor_id,
            'valor' => $contrato->valor_semanal,
            'data_referencia' => $contrato->data_inicio,
            'status' => StatusPagamento::PENDENTE,
        ]);
    }

    public function gerarPagamentosSemanaisPendentes(): int
    {
        $this->marcarAtrasadosPorDataReferencia();

        $numCriados = 0;

        $arrContratos = Contrato::query()
            ->where('status', StatusContrato::ATIVO)
            ->where(function ($q) {
                $q->whereNull('data_fim')->orWhereDate('data_fim', '>=', now()->toDateString());
            })
            ->get();

        foreach ($arrContratos as $objContrato) {
            $objUltimo = $objContrato->pagamentos()->orderByDesc('data_referencia')->first();
            if (!$objUltimo) {
                continue;
            }

            $dtaProxima = $objUltimo->data_referencia->copy()->addWeek();

            while ($dtaProxima->lte(now()->toDateString())) {
                if ($objContrato->data_fim && $dtaProxima->gt($objContrato->data_fim)) {
                    break;
                }

                $bolExiste = $objContrato->pagamentos()
                    ->whereDate('data_referencia', $dtaProxima->toDateString())
                    ->exists();

                if (!$bolExiste) {
                    Pagamento::create([
                        'contrato_id' => $objContrato->id,
                        'veiculo_id' => $objContrato->veiculo_id,
                        'condutor_id' => $objContrato->condutor_id,
                        'valor' => $objContrato->valor_semanal,
                        'data_referencia' => $dtaProxima->toDateString(),
                        'status' => StatusPagamento::PENDENTE,
                    ]);
                    $numCriados++;
                }

                $dtaProxima->addWeek();
            }
        }

        return $numCriados;
    }
}

<?php

namespace App\Services;

use App\Enums\PrioridadeAlerta;
use App\Enums\StatusPagamento;
use App\Enums\TipoAlerta;
use App\Models\Alerta;
use App\Models\Contrato;
use App\Models\LeituraKm;
use App\Models\Pagamento;
use App\Models\Veiculo;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LeituraKmService
{
    private const NUM_KM_TROCA_OLEO = 10000;

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        $query = $veiculo->leiturasKm()->with(['contrato', 'condutor', 'pagamento']);

        if (! empty($filtros['data_inicio'])) {
            $query->whereDataEfetivaLeitura('>=', $filtros['data_inicio']);
        }
        if (! empty($filtros['data_fim'])) {
            $query->whereDataEfetivaLeitura('<=', $filtros['data_fim']);
        }

        return $query
            ->orderByDesc('data_leitura')
            ->orderByDesc('created_at')
            ->paginate($filtros['por_pagina'] ?? 15);
    }

    public function kmMinimoPermitidoParaVeiculo(Veiculo $veiculo, ?int $numLeituraIdIgnorar = null): int
    {
        return $this->resolverKmMinimoPermitido($veiculo, $numLeituraIdIgnorar);
    }

    public function registrar(Veiculo $veiculo, array $dados, ?UploadedFile $arquivoFoto): LeituraKm
    {
        return DB::transaction(function () use ($veiculo, $dados, $arquivoFoto) {
            $numKmSolicitado = (int) $dados['km'];
            $numPagamentoId = isset($dados['pagamento_id']) ? (int) $dados['pagamento_id'] : 0;
            if ($numPagamentoId < 1) {
                throw new \DomainException('pagamento_id e obrigatorio.');
            }

            $objVeiculo = Veiculo::query()->whereKey($veiculo->id)->lockForUpdate()->firstOrFail();

            $objPagamento = Pagamento::query()
                ->whereKey($numPagamentoId)
                ->where('veiculo_id', $objVeiculo->id)
                ->lockForUpdate()
                ->first();
            if ($objPagamento === null) {
                throw new \DomainException('Pagamento nao encontrado ou nao pertence a este veiculo.');
            }
            if ($objPagamento->status !== StatusPagamento::PAGO) {
                throw new \DomainException('Apenas pagamentos com status PAGO podem ser vinculados a leitura.');
            }
            if (LeituraKm::query()->where('pagamento_id', $numPagamentoId)->exists()) {
                throw new \DomainException('Este pagamento ja possui leitura de quilometragem vinculada.');
            }

            $numContratoId = $objPagamento->contrato_id;
            $numCondutorId = $objPagamento->condutor_id;
            $strDataRef = ! empty($dados['data_referencia'])
                ? (string) $dados['data_referencia']
                : $objPagamento->data_referencia?->toDateString();

            $numKmMinimo = $this->resolverKmMinimoPermitido($objVeiculo, null);

            if ($numKmSolicitado < $numKmMinimo) {
                throw new \DomainException(
                    'Quilometragem nao pode ser inferior a ' . $numKmMinimo . ' (ultima leitura ou km atual do veiculo).'
                );
            }

            $strDataLeitura = $dados['data_leitura'] ?? now()->toDateString();
            if ($strDataRef === null && $numContratoId !== null) {
                $strDataRef = $this->resolverDataReferenciaLeitura((int) $numContratoId, $strDataLeitura);
            }

            $strCaminhoFoto = '';
            if ($arquivoFoto !== null) {
                $strCaminhoFoto = $arquivoFoto->store('fotos/leituras-km', 'public');
            }

            $leitura = $this->criarLeituraKmOuLancarDuplicata([
                'veiculo_id' => $objVeiculo->id,
                'contrato_id' => $numContratoId,
                'condutor_id' => $numCondutorId,
                'pagamento_id' => $numPagamentoId,
                'km' => $numKmSolicitado,
                'data_leitura' => $strDataLeitura,
                'data_referencia' => $strDataRef,
                'caminho_foto' => $strCaminhoFoto,
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            $objVeiculo->update(['km_atual' => $numKmSolicitado]);

            $this->criarAlertaTrocaOleoSeNecessario($objVeiculo->fresh());

            return $leitura->load(['contrato', 'condutor', 'veiculo', 'pagamento']);
        });
    }

    public function sincronizarKmDoPagamento(
        Pagamento $pagamento,
        int $numKm,
        StatusPagamento $statusPagamento,
        ?string $strDataPagamentoReal
    ): void {
        if ($statusPagamento !== StatusPagamento::PAGO) {
            throw new \DomainException('Quilometragem do pagamento so pode ser informada quando o status e PAGO.');
        }

        $objPagamento = Pagamento::query()->whereKey($pagamento->id)->lockForUpdate()->firstOrFail();
        $veiculo = Veiculo::query()->whereKey($objPagamento->veiculo_id)->lockForUpdate()->firstOrFail();

        $strDataLeitura = $objPagamento->data_pagamento?->toDateString()
            ?? $strDataPagamentoReal
            ?? $objPagamento->data_referencia?->toDateString()
            ?? now()->toDateString();

        $objLeituraExistente = LeituraKm::query()
            ->where('pagamento_id', $objPagamento->id)
            ->first();

        if ($objLeituraExistente !== null) {
            $numMin = $this->resolverKmMinimoPermitido($veiculo, $objLeituraExistente->id);
            if ($numKm < $numMin) {
                throw new \DomainException(
                    'Quilometragem nao pode ser inferior a ' . $numMin . ' (ultima leitura ou km atual do veiculo).'
                );
            }
            $objLeituraExistente->update([
                'km' => $numKm,
                'data_leitura' => $strDataLeitura,
                'data_referencia' => $objPagamento->data_referencia?->toDateString(),
            ]);
        } else {
            $numMin = $this->resolverKmMinimoPermitido($veiculo, null);
            if ($numKm < $numMin) {
                throw new \DomainException(
                    'Quilometragem nao pode ser inferior a ' . $numMin . ' (ultima leitura ou km atual do veiculo).'
                );
            }
            $this->criarLeituraKmOuLancarDuplicata([
                'pagamento_id' => $objPagamento->id,
                'veiculo_id' => $objPagamento->veiculo_id,
                'contrato_id' => $objPagamento->contrato_id,
                'condutor_id' => $objPagamento->condutor_id,
                'km' => $numKm,
                'data_leitura' => $strDataLeitura,
                'data_referencia' => $objPagamento->data_referencia?->toDateString(),
                'caminho_foto' => '',
                'observacoes' => null,
            ]);
        }

        $veiculo->refresh();
        $veiculo->update(['km_atual' => max((int) $veiculo->km_atual, $numKm)]);

        $this->criarAlertaTrocaOleoSeNecessario($veiculo->fresh());
    }

    /**
     * @param  array<string, mixed>  $arrAtributos
     */
    private function criarLeituraKmOuLancarDuplicata(array $arrAtributos): LeituraKm
    {
        try {
            return LeituraKm::create($arrAtributos);
        } catch (QueryException $e) {
            if ($this->bolViolacaoUniquePagamento($e)) {
                throw new \DomainException('Este pagamento ja possui leitura de quilometragem vinculada.');
            }
            throw $e;
        }
    }

    private function bolViolacaoUniquePagamento(QueryException $objException): bool
    {
        $strMsg = strtolower($objException->getMessage());

        return str_contains($strMsg, 'unique') || str_contains($strMsg, 'duplicate');
    }

    private function resolverKmMinimoPermitido(Veiculo $veiculo, ?int $numLeituraIdIgnorar): int
    {
        $query = $veiculo->leiturasKm();
        if ($numLeituraIdIgnorar !== null) {
            $query->where('id', '!=', $numLeituraIdIgnorar);
        }
        $numUltimaLeitura = (int) ($query->max('km') ?? 0);
        $numBaseVeiculo = max(
            (int) $veiculo->km_atual,
            (int) ($veiculo->km_rastreador ?? 0)
        );

        return max($numBaseVeiculo, $numUltimaLeitura);
    }

    private function resolverDataReferenciaLeitura(int $numContratoId, string $strDataLeitura): ?string
    {
        $objPagamento = Pagamento::query()
            ->where('contrato_id', $numContratoId)
            ->whereDate('data_referencia', '<=', $strDataLeitura)
            ->orderByDesc('data_referencia')
            ->first();

        if ($objPagamento !== null) {
            return $objPagamento->data_referencia->toDateString();
        }

        $objContrato = Contrato::find($numContratoId);

        return $objContrato?->data_inicio?->toDateString();
    }

    private function criarAlertaTrocaOleoSeNecessario(Veiculo $veiculo): void
    {
        $numKmDesdeTroca = (int) $veiculo->km_atual - (int) $veiculo->km_ultima_troca_oleo;

        if ($numKmDesdeTroca < self::NUM_KM_TROCA_OLEO) {
            return;
        }

        $bolJaExiste = Alerta::query()
            ->where('tipo_alerta', TipoAlerta::TROCA_OLEO)
            ->where('entidade_tipo', Veiculo::class)
            ->where('entidade_id', $veiculo->id)
            ->where('resolvido', false)
            ->exists();

        if ($bolJaExiste) {
            return;
        }

        Alerta::create([
            'tipo_alerta' => TipoAlerta::TROCA_OLEO,
            'entidade_tipo' => Veiculo::class,
            'entidade_id' => $veiculo->id,
            'mensagem' => 'Veiculo ' . $veiculo->placa . ' atingiu ' . $numKmDesdeTroca . ' km desde a ultima troca de oleo (limite ' . self::NUM_KM_TROCA_OLEO . ' km).',
            'prioridade' => PrioridadeAlerta::ALTA,
        ]);
    }
}

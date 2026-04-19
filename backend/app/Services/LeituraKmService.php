<?php

namespace App\Services;

use App\Enums\PrioridadeAlerta;
use App\Enums\TipoAlerta;
use App\Models\Alerta;
use App\Models\Contrato;
use App\Models\LeituraKm;
use App\Models\Pagamento;
use App\Models\Veiculo;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LeituraKmService
{
    private const NUM_KM_TROCA_OLEO = 10000;

    public function listarPorVeiculo(Veiculo $veiculo, array $filtros = []): LengthAwarePaginator
    {
        $query = $veiculo->leiturasKm()->with(['contrato', 'condutor']);

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

    public function registrar(Veiculo $veiculo, array $dados, ?UploadedFile $arquivoFoto): LeituraKm
    {
        return DB::transaction(function () use ($veiculo, $dados, $arquivoFoto) {
            $numKmSolicitado = (int) $dados['km'];

            $numUltimaLeitura = (int) ($veiculo->leiturasKm()->max('km') ?? 0);
            $numBaseVeiculo = max(
                (int) $veiculo->km_atual,
                (int) ($veiculo->km_rastreador ?? 0)
            );
            $numKmMinimo = max($numBaseVeiculo, $numUltimaLeitura);

            if ($numKmSolicitado < $numKmMinimo) {
                throw new \DomainException(
                    'Quilometragem nao pode ser inferior a '.$numKmMinimo.' (ultima leitura ou km atual do veiculo).'
                );
            }

            $strDataLeitura = $dados['data_leitura'] ?? now()->toDateString();
            $strDataRef = $dados['data_referencia'] ?? null;
            if ($strDataRef === null && ! empty($dados['contrato_id'])) {
                $strDataRef = $this->resolverDataReferenciaLeitura((int) $dados['contrato_id'], $strDataLeitura);
            }

            $strCaminhoFoto = '';
            if ($arquivoFoto !== null) {
                $strCaminhoFoto = $arquivoFoto->store('fotos/leituras-km', 'public');
            }

            $leitura = LeituraKm::create([
                'veiculo_id' => $veiculo->id,
                'contrato_id' => $dados['contrato_id'] ?? null,
                'condutor_id' => $dados['condutor_id'] ?? null,
                'km' => $numKmSolicitado,
                'data_leitura' => $strDataLeitura,
                'data_referencia' => $strDataRef,
                'caminho_foto' => $strCaminhoFoto,
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            $veiculo->update(['km_atual' => $numKmSolicitado]);

            $this->criarAlertaTrocaOleoSeNecessario($veiculo->fresh());

            return $leitura->load(['contrato', 'condutor', 'veiculo']);
        });
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
            'mensagem' => 'Veiculo '.$veiculo->placa.' atingiu '.$numKmDesdeTroca.' km desde a ultima troca de oleo (limite '.self::NUM_KM_TROCA_OLEO.' km).',
            'prioridade' => PrioridadeAlerta::ALTA,
        ]);
    }
}

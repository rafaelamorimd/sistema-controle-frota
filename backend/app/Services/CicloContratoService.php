<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\LeituraKm;
use App\Models\Pagamento;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CicloContratoService
{
    /**
     * Dados do primeiro ciclo de 4 semanas (5 pagamentos semanais), para relatórios.
     *
     * @return array{
     *   dth_inicio: Carbon,
     *   dth_fim_ciclo: Carbon,
     *   arr_pagamentos_ciclo: Collection<int, Pagamento>,
     *   num_km_inicial: int,
     *   num_km_final: int|null,
     *   num_km_rodado: int|null
     * }|null
     */
    public function obterResumoPrimeiroCicloQuatroSemanas(Contrato $objContrato): ?array
    {
        $arrPagamentos = $objContrato->pagamentos()
            ->orderBy('data_referencia')
            ->orderBy('id')
            ->get();

        if ($arrPagamentos->count() < 5) {
            return null;
        }

        $arrCincoPrimeiros = $arrPagamentos->take(5);
        $objQuintoPagamento = $arrCincoPrimeiros->get(4);
        $dtaLimite = $objQuintoPagamento->data_referencia;
        $numKmInicial = (int) $objContrato->km_inicial;
        $strLimite = $dtaLimite->toDateString();

        $objLeitura = LeituraKm::query()
            ->where('contrato_id', $objContrato->id)
            ->where('veiculo_id', $objContrato->veiculo_id)
            ->whereDataEfetivaLeitura('<=', $strLimite)
            ->orderByDesc('km')
            ->first();

        $numKmFinal = $objLeitura?->km;
        $numKmRodado = $objLeitura === null ? null : max(0, $objLeitura->km - $numKmInicial);

        return [
            'dth_inicio' => $objContrato->data_inicio->copy()->startOfDay(),
            'dth_fim_ciclo' => $dtaLimite->copy()->startOfDay(),
            'arr_pagamentos_ciclo' => $arrCincoPrimeiros,
            'num_km_inicial' => $numKmInicial,
            'num_km_final' => $numKmFinal,
            'num_km_rodado' => $numKmRodado,
        ];
    }

    /**
     * KM rodado nas primeiras quatro semanas completas da locação (ciclo fechado no 5º pagamento semanal).
     *
     * Retorna null se houver menos de 5 pagamentos ou nenhuma leitura aplicável.
     */
    public function calcularKmRodadoPrimeiroCicloQuatroSemanas(Contrato $objContrato): ?int
    {
        $arrResumo = $this->obterResumoPrimeiroCicloQuatroSemanas($objContrato);
        if ($arrResumo === null) {
            return null;
        }

        return $arrResumo['num_km_rodado'];
    }
}

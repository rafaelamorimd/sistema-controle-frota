<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\LeituraKm;

class CicloContratoService
{
    /**
     * KM rodado nas primeiras quatro semanas completas da locação (ciclo fechado no 5º pagamento semanal).
     *
     * Regra: ordena pagamentos por `data_referencia`; o 5º registro (índice 4) corresponde ao fim das 4 semanas
     * após o 1º pagamento (fechamento do contrato). O KM final considerado é o maior hodômetro registrado em
     * leitura do contrato com `created_at` até o fim do dia da data de referência do 5º pagamento.
     *
     * Retorna null se houver menos de 5 pagamentos ou nenhuma leitura aplicável.
     */
    public function calcularKmRodadoPrimeiroCicloQuatroSemanas(Contrato $objContrato): ?int
    {
        $arrPagamentos = $objContrato->pagamentos()
            ->orderBy('data_referencia')
            ->orderBy('id')
            ->get();

        if ($arrPagamentos->count() < 5) {
            return null;
        }

        $objQuintoPagamento = $arrPagamentos->get(4);
        $dtaLimite = $objQuintoPagamento->data_referencia;
        $numKmInicial = (int) $objContrato->km_inicial;

        $objLeitura = LeituraKm::query()
            ->where('contrato_id', $objContrato->id)
            ->where('veiculo_id', $objContrato->veiculo_id)
            ->whereDate('created_at', '<=', $dtaLimite->toDateString())
            ->orderByDesc('km')
            ->first();

        if ($objLeitura === null) {
            return null;
        }

        return max(0, $objLeitura->km - $numKmInicial);
    }
}

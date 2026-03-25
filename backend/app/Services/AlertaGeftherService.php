<?php

namespace App\Services;

use App\Enums\PrioridadeAlerta;
use App\Enums\TipoAlerta;
use App\Models\Alerta;
use App\Models\Multa;
use App\Models\Peca;
use App\Models\Veiculo;
use App\Enums\StatusMulta;
use Carbon\Carbon;

class AlertaGeftherService
{
    public function gerarAlertasVencimentosVeiculos(): int
    {
        $numCriados = 0;
        $dthLimite = now()->addDays(30);

        $veiculos = Veiculo::query()->get();

        foreach ($veiculos as $veiculo) {
            $numCriados += $this->alertaData($veiculo, 'vencimento_ipva', TipoAlerta::IPVA, 'IPVA', $dthLimite);
            $numCriados += $this->alertaData($veiculo, 'vencimento_seguro', TipoAlerta::SEGURO, 'seguro', $dthLimite);
            $numCriados += $this->alertaData($veiculo, 'vencimento_gnv', TipoAlerta::GNV, 'GNV', $dthLimite);
        }

        return $numCriados;
    }

    private function alertaData(Veiculo $veiculo, string $strCampo, TipoAlerta $tipo, string $strRotulo, Carbon $dthLimite): int
    {
        $dta = $veiculo->{$strCampo};
        if (!$dta) {
            return 0;
        }

        $dthVenc = Carbon::parse($dta)->startOfDay();
        if ($dthVenc->gt($dthLimite) || $dthVenc->lt(now()->startOfDay())) {
            return 0;
        }

        $bolJaExiste = Alerta::query()
            ->where('tipo_alerta', $tipo)
            ->where('entidade_tipo', Veiculo::class)
            ->where('entidade_id', $veiculo->id)
            ->where('resolvido', false)
            ->exists();

        if ($bolJaExiste) {
            return 0;
        }

        Alerta::create([
            'tipo_alerta' => $tipo,
            'entidade_tipo' => Veiculo::class,
            'entidade_id' => $veiculo->id,
            'mensagem' => 'Veiculo '.$veiculo->placa.': vencimento '.$strRotulo.' em '.$dthVenc->format('d/m/Y').'.',
            'prioridade' => PrioridadeAlerta::MEDIA,
        ]);

        return 1;
    }

    public function gerarAlertasMultasVencendo(): int
    {
        $numCriados = 0;
        $dthLimite = now()->addDays(15);

        $multas = Multa::query()
            ->with('veiculo')
            ->where('status', StatusMulta::PENDENTE)
            ->whereDate('data_vencimento', '<=', $dthLimite->toDateString())
            ->whereDate('data_vencimento', '>=', now()->toDateString())
            ->get();

        foreach ($multas as $multa) {
            $bolJaExiste = Alerta::query()
                ->where('tipo_alerta', TipoAlerta::MULTA)
                ->where('entidade_tipo', Multa::class)
                ->where('entidade_id', $multa->id)
                ->where('resolvido', false)
                ->exists();

            if ($bolJaExiste) {
                continue;
            }

            Alerta::create([
                'tipo_alerta' => TipoAlerta::MULTA,
                'entidade_tipo' => Multa::class,
                'entidade_id' => $multa->id,
                'mensagem' => 'Multa veiculo '.$multa->veiculo->placa.' vence em '.$multa->data_vencimento->format('d/m/Y').' (R$ '.number_format((float) $multa->valor, 2, ',', '.').').',
                'prioridade' => PrioridadeAlerta::ALTA,
            ]);
            $numCriados++;
        }

        return $numCriados;
    }

    public function gerarAlertasEstoqueMinimo(): int
    {
        $numCriados = 0;

        $pecas = Peca::query()
            ->whereNotNull('estoque_minimo')
            ->whereColumn('quantidade_estoque', '<=', 'estoque_minimo')
            ->get();

        foreach ($pecas as $peca) {
            $bolJaExiste = Alerta::query()
                ->where('tipo_alerta', TipoAlerta::ESTOQUE)
                ->where('entidade_tipo', Peca::class)
                ->where('entidade_id', $peca->id)
                ->where('resolvido', false)
                ->exists();

            if ($bolJaExiste) {
                continue;
            }

            Alerta::create([
                'tipo_alerta' => TipoAlerta::ESTOQUE,
                'entidade_tipo' => Peca::class,
                'entidade_id' => $peca->id,
                'mensagem' => 'Peca '.$peca->nome.' abaixo do estoque minimo ('.$peca->quantidade_estoque.' / min. '.$peca->estoque_minimo.').',
                'prioridade' => PrioridadeAlerta::MEDIA,
            ]);
            $numCriados++;
        }

        return $numCriados;
    }
}

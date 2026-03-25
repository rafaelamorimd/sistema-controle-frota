<?php

namespace App\Console\Commands;

use App\Services\AlertaGeftherService;
use Illuminate\Console\Command;

class GeftherGerarAlertasCommand extends Command
{
    protected $signature = 'gefther:gerar-alertas';

    protected $description = 'Gera alertas de vencimentos, multas e estoque minimo';

    public function handle(AlertaGeftherService $service): int
    {
        $n1 = $service->gerarAlertasVencimentosVeiculos();
        $n2 = $service->gerarAlertasMultasVencendo();
        $n3 = $service->gerarAlertasEstoqueMinimo();
        $this->info('Alertas vencimentos: '.$n1.' | multas: '.$n2.' | estoque: '.$n3);

        return self::SUCCESS;
    }
}

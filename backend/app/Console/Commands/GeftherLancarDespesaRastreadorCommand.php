<?php

namespace App\Console\Commands;

use App\Services\DespesaService;
use Illuminate\Console\Command;

class GeftherLancarDespesaRastreadorCommand extends Command
{
    protected $signature = 'gefther:lancar-despesa-rastreador';

    protected $description = 'Lanca despesa mensal de rastreador para veiculos com rastreador ativo';

    public function handle(DespesaService $service): int
    {
        $num = $service->lancarDespesasRastreadorMensal();
        $this->info('Despesas de rastreador criadas: '.$num);

        return self::SUCCESS;
    }
}

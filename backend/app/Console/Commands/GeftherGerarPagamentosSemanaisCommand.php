<?php

namespace App\Console\Commands;

use App\Services\PagamentoService;
use Illuminate\Console\Command;

class GeftherGerarPagamentosSemanaisCommand extends Command
{
    protected $signature = 'gefther:gerar-pagamentos-semanais';

    protected $description = 'Gera registros de pagamento semanal em atraso para contratos ativos';

    public function handle(PagamentoService $service): int
    {
        $num = $service->gerarPagamentosSemanaisPendentes();
        $this->info('Pagamentos criados: '.$num);

        return self::SUCCESS;
    }
}

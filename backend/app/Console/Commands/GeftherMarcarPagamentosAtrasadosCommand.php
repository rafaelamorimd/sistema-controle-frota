<?php

namespace App\Console\Commands;

use App\Services\PagamentoService;
use Illuminate\Console\Command;

class GeftherMarcarPagamentosAtrasadosCommand extends Command
{
    protected $signature = 'gefther:marcar-pagamentos-atrasados';

    protected $description = 'Atualiza pagamentos pendentes com data de referencia passada para status ATRASADO';

    public function handle(PagamentoService $service): int
    {
        $num = $service->marcarAtrasadosPorDataReferencia();
        $this->info('Pagamentos marcados como atrasados: '.$num);

        return self::SUCCESS;
    }
}

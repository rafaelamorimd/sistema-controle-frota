<?php

namespace App\Console\Commands;

use App\Services\RastreadorService;
use Illuminate\Console\Command;

class GeftherSincronizarRastreadorExternoCommand extends Command
{
    protected $signature = 'gefther:sincronizar-rastreador-externo';

    protected $description = 'Vincula veiculo_id_externo aos veiculos locais conforme o driver de rastreamento ativo';

    public function handle(RastreadorService $service): int
    {
        $arr = $service->sincronizarVinculosEmLote();
        $this->info(
            'Vinculados: '.$arr['vinculados'].' | Sem match: '.$arr['sem_match'].' | Erros: '.$arr['erros']
        );

        return self::SUCCESS;
    }
}

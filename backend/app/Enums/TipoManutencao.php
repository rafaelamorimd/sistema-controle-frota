<?php

namespace App\Enums;

enum TipoManutencao: string
{
    case PREVENTIVA = 'PREVENTIVA';
    case CORRETIVA = 'CORRETIVA';
    case PREDITIVA = 'PREDITIVA';
}

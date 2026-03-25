<?php

namespace App\Enums;

enum StatusMulta: string
{
    case PENDENTE = 'PENDENTE';
    case PAGA = 'PAGA';
    case RECURSO = 'RECURSO';
    case TRANSFERIDA_CONDUTOR = 'TRANSFERIDA_CONDUTOR';
}

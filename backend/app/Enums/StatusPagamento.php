<?php

namespace App\Enums;

enum StatusPagamento: string
{
    case PENDENTE = 'PENDENTE';
    case PAGO = 'PAGO';
    case ATRASADO = 'ATRASADO';
}

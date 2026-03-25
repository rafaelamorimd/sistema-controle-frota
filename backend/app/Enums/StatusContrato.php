<?php

namespace App\Enums;

enum StatusContrato: string
{
    case ATIVO = 'ATIVO';
    case ENCERRADO = 'ENCERRADO';
    case CANCELADO = 'CANCELADO';
    case SUSPENSO = 'SUSPENSO';
}

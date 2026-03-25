<?php

namespace App\Enums;

enum StatusCondutor: string
{
    case ATIVO = 'ATIVO';
    case INATIVO = 'INATIVO';
    case BLOQUEADO = 'BLOQUEADO';
}

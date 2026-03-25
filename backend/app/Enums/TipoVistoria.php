<?php

namespace App\Enums;

enum TipoVistoria: string
{
    case ENTREGA = 'ENTREGA';
    case DEVOLUCAO = 'DEVOLUCAO';
    case PERIODICA = 'PERIODICA';
}

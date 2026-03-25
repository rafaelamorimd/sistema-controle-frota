<?php

namespace App\Enums;

enum TipoAlerta: string
{
    case TROCA_OLEO = 'TROCA_OLEO';
    case GNV = 'GNV';
    case CNH = 'CNH';
    case IPVA = 'IPVA';
    case SEGURO = 'SEGURO';
    case MULTA = 'MULTA';
    case ESTOQUE = 'ESTOQUE';
    case PAGAMENTO_ATRASADO = 'PAGAMENTO_ATRASADO';
}

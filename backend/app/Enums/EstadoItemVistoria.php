<?php

namespace App\Enums;

enum EstadoItemVistoria: string
{
    case BOM = 'BOM';
    case AVARIADO = 'AVARIADO';
    case FALTANTE = 'FALTANTE';
}

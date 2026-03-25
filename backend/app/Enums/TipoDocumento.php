<?php

namespace App\Enums;

enum TipoDocumento: string
{
    case CNH_FRENTE = 'CNH_FRENTE';
    case CNH_VERSO = 'CNH_VERSO';
    case COMPROVANTE_RESIDENCIA = 'COMPROVANTE_RESIDENCIA';
    case CADASTRO_UBER = 'CADASTRO_UBER';
    case SELFIE = 'SELFIE';
    case OUTRO = 'OUTRO';
}

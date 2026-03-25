<?php

namespace App\Enums;

enum PerfilUsuario: string
{
    case ADMIN = 'ADMIN';
    case OPERADOR = 'OPERADOR';
    case VISUALIZADOR = 'VISUALIZADOR';
}

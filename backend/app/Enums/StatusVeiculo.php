<?php

namespace App\Enums;

enum StatusVeiculo: string
{
    case DISPONIVEL = 'DISPONIVEL';
    case ALUGADO = 'ALUGADO';
    case MANUTENCAO = 'MANUTENCAO';
    case INATIVO = 'INATIVO';
}

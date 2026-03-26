<?php

namespace App\Services;

use App\Models\Configuracao;

class ConfiguracaoService
{
    public function obterMap(): array
    {
        return Configuracao::query()
            ->pluck('valor', 'chave')
            ->toArray();
    }

    public function salvarMap(array $dados): void
    {
        foreach ($dados as $chave => $valor) {
            Configuracao::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valor]
            );
        }
    }
}

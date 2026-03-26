<?php

namespace Database\Seeders;

use App\Models\Configuracao;
use Illuminate\Database\Seeder;

class ConfiguracaoLocadorSeeder extends Seeder
{
    public function run(): void
    {
        $bolUsarDadosTeste = env('SEEDER_DADOS_TESTE', false);

        $arrDados = [
            'locador_nome' => $bolUsarDadosTeste ? 'João da Silva Locações' : '',
            'locador_cpf' => $bolUsarDadosTeste ? '123.456.789-00' : '',
            'locador_endereco' => $bolUsarDadosTeste ? 'Rua das Flores, 123, Centro, São Paulo, SP' : '',
            'locador_pix' => $bolUsarDadosTeste ? '12345678900' : '',
            'locador_banco' => $bolUsarDadosTeste ? 'Banco do Brasil - Ag: 1234-5 - CC: 12345-6' : '',
            'locador_cidade_uf' => $bolUsarDadosTeste ? 'São Paulo/SP' : '',
        ];

        foreach ($arrDados as $strChave => $strValor) {
            Configuracao::updateOrCreate(
                ['chave' => $strChave],
                ['valor' => $strValor]
            );
        }

        if ($bolUsarDadosTeste) {
            $this->command->info('Configurações do locador criadas com DADOS DE TESTE.');
        } else {
            $this->command->info('Configurações do locador criadas vazias.');
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('AdminSeeder ignorado em producao.');
            return;
        }

        $strSenhaAdmin = 'admin123';

        User::updateOrCreate(
            ['email' => 'admin@gefther.com.br'],
            [
                'name' => 'Administrador',
                'password' => Hash::make($strSenhaAdmin),
                'perfil' => 'ADMIN',
                'ativo' => true,
            ]
        );

        $this->command->info('Admin admin@gefther.com.br criado/atualizado. Senha inicial: admin123');
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $strSenhaAdmin = env('ADMIN_PASSWORD', 'admin123');

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@gefther.com.br')],
            [
                'name' => 'Administrador',
                'password' => Hash::make($strSenhaAdmin),
                'perfil' => 'ADMIN',
                'ativo' => true,
            ]
        );
    }
}

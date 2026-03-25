<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'condutor_id' => 'required|exists:condutores,id',
            'veiculo_id' => 'required|exists:veiculos,id',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after:data_inicio',
            'valor_semanal' => 'required|numeric|min:0',
            'dia_pagamento' => 'required|integer|min:1|max:7',
            'caucao' => 'nullable|numeric|min:0',
            'km_inicial' => 'required|integer|min:0',
            'clausulas_adicionais' => 'nullable|string',
        ];
    }
}

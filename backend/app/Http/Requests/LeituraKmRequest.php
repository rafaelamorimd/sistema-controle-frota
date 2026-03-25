<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeituraKmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'km' => 'required|integer|min:0',
            'foto' => 'required|file|mimes:jpg,jpeg,png|max:10240',
            'contrato_id' => 'nullable|exists:contratos,id',
            'condutor_id' => 'nullable|exists:condutores,id',
            'observacoes' => 'nullable|string|max:2000',
        ];
    }
}

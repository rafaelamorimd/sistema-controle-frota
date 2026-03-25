<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CondutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $condutorId = $this->route('condutor')?->id;

        return [
            'nome' => 'required|string|max:200',
            'cpf' => [
                'required', 'string', 'size:11',
                Rule::unique('condutores')->ignore($condutorId),
            ],
            'telefone' => 'required|string|max:20',
            'email' => 'nullable|email|max:200',
            'endereco' => 'required|string',
            'numero_cnh' => 'required|string|max:20',
            'categoria_cnh' => 'required|string|in:A,B,AB,C,D,E',
            'vencimento_cnh' => 'required|date',
            'observacoes' => 'nullable|string',
        ];
    }
}

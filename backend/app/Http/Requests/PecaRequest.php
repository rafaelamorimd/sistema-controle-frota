<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PecaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bolAtualiza = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'nome' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:255',
            'codigo' => 'nullable|string|max:100',
            'categoria' => 'nullable|string|max:100',
            'quantidade_estoque' => 'nullable|integer|min:0',
            'estoque_minimo' => 'nullable|integer|min:0',
            'custo_medio' => 'nullable|numeric|min:0',
        ];
    }
}

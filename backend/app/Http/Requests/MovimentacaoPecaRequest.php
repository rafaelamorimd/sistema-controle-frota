<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MovimentacaoPecaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo' => 'required|string|in:ENTRADA,SAIDA',
            'quantidade' => 'required|integer|min:1',
            'custo_unitario' => 'nullable|numeric|min:0',
            'manutencao_id' => 'nullable|exists:manutencoes,id',
            'veiculo_id' => 'nullable|exists:veiculos,id',
            'observacao' => 'nullable|string|max:2000',
        ];
    }
}

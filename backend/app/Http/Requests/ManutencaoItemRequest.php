<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManutencaoItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bolAtualiza = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'peca_id' => 'nullable|exists:pecas,id',
            'servico_realizado' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:500',
            'quantidade' => 'nullable|integer|min:1',
            'custo_unitario' => ($bolAtualiza ? 'sometimes|' : '').'required|numeric|min:0',
            'custo_total' => 'nullable|numeric|min:0',
            'baixar_estoque' => 'nullable|boolean',
        ];
    }
}

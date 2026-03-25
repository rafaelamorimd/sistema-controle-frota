<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChecklistRevisaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bolAtualiza = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'veiculo_id' => ($bolAtualiza ? 'sometimes|' : '').'required|exists:veiculos,id',
            'manutencao_id' => 'nullable|exists:manutencoes,id',
            'data_revisao' => ($bolAtualiza ? 'sometimes|' : '').'required|date',
            'km_revisao' => ($bolAtualiza ? 'sometimes|' : '').'required|integer|min:0',
            'itens_verificados' => ($bolAtualiza ? 'sometimes|' : '').'required|array',
        ];
    }
}

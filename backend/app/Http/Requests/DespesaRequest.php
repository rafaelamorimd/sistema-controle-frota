<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DespesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $atualizacao = $this->isMethod('put');

        return [
            'veiculo_id' => ($atualizacao ? 'sometimes|' : '').'required|exists:veiculos,id',
            'descricao' => ($atualizacao ? 'sometimes|' : '').'required|string|max:500',
            'categoria' => 'nullable|string|max:100',
            'valor' => ($atualizacao ? 'sometimes|' : '').'required|numeric|min:0.01',
            'data_vencimento' => 'nullable|date',
            'status' => 'nullable|string|in:PENDENTE,PAGO',
            'observacoes' => 'nullable|string|max:2000',
        ];
    }
}

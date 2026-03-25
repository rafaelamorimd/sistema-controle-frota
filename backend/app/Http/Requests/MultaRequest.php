<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MultaRequest extends FormRequest
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
            'condutor_id' => 'nullable|exists:condutores,id',
            'contrato_id' => 'nullable|exists:contratos,id',
            'auto_infracao' => 'nullable|string|max:100',
            'data_infracao' => ($bolAtualiza ? 'sometimes|' : '').'required|date',
            'descricao' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:5000',
            'valor' => ($bolAtualiza ? 'sometimes|' : '').'required|numeric|min:0.01',
            'data_vencimento' => ($bolAtualiza ? 'sometimes|' : '').'required|date',
            'status' => 'nullable|string|in:PENDENTE,PAGA,RECURSO,TRANSFERIDA_CONDUTOR',
            'indicada_condutor' => 'nullable|boolean',
            'observacoes' => 'nullable|string|max:5000',
            'comprovante' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }
}

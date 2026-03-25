<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VistoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contrato_id' => 'required|exists:contratos,id',
            'veiculo_id' => 'required|exists:veiculos,id',
            'tipo' => 'required|string|in:ENTREGA,DEVOLUCAO,PERIODICA',
            'data_vistoria' => 'required|date',
            'km_momento' => 'required|integer|min:0',
            'nivel_combustivel' => 'nullable|string|in:VAZIO,1_4,1_2,3_4,CHEIO',
            'observacoes' => 'nullable|string',
        ];
    }
}

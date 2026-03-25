<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VeiculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $veiculoId = $this->route('veiculo')?->id;

        return [
            'placa' => [
                'required', 'string', 'max:8',
                Rule::unique('veiculos')->ignore($veiculoId),
                'regex:/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/',
            ],
            'modelo' => 'required|string|max:100',
            'ano' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'renavam' => [
                'required', 'string', 'size:11',
                Rule::unique('veiculos')->ignore($veiculoId),
            ],
            'chassi' => 'nullable|string|size:17',
            'cor' => 'required|string|max:30',
            'combustivel' => 'required|string|in:GASOLINA,FLEX,GNV,DIESEL',
            'kit_gas' => 'required|boolean',
            'vencimento_gnv' => 'required_if:kit_gas,true|nullable|date',
            'km_atual' => 'required|integer|min:0',
            'km_ultima_troca_oleo' => 'required|integer|min:0',
            'numero_rastreador' => 'nullable|string|max:50',
            'rastreador_ativo' => 'boolean',
            'valor_rastreador' => 'numeric|min:0',
            'vencimento_ipva' => 'nullable|date',
            'vencimento_seguro' => 'nullable|date',
            'observacoes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'placa.regex' => 'Formato de placa invalido. Use ABC1D23 ou ABC1234.',
            'vencimento_gnv.required_if' => 'Data de vencimento do GNV obrigatoria quando kit gas esta ativo.',
        ];
    }
}

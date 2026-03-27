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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $mixItens = $this->input('itens_verificados');
            if (! is_array($mixItens)) {
                return;
            }
            foreach ($mixItens as $strChave => $mixValor) {
                if (! is_string($strChave) || $strChave === '') {
                    $validator->errors()->add('itens_verificados', 'Chave de item invalida.');

                    continue;
                }
                if (strlen($strChave) > 120) {
                    $validator->errors()->add('itens_verificados', 'Chave de item muito longa.');
                }
                if (is_string($mixValor)) {
                    $strNorm = strtolower($mixValor);
                    if (! in_array($strNorm, ['ok', 'verificar', 'trocar'], true)) {
                        $validator->errors()->add('itens_verificados', "Valor invalido em {$strChave} (use ok, verificar ou trocar).");
                    }

                    continue;
                }
                if (! is_array($mixValor)) {
                    $validator->errors()->add('itens_verificados', "Item {$strChave}: formato invalido.");

                    continue;
                }
                $strStatus = $mixValor['status'] ?? null;
                if (! is_string($strStatus) || ! in_array($strStatus, ['ok', 'verificar', 'trocar'], true)) {
                    $validator->errors()->add('itens_verificados', "Item {$strChave}: status deve ser ok, verificar ou trocar.");
                }
                if (isset($mixValor['obs']) && ! is_string($mixValor['obs'])) {
                    $validator->errors()->add('itens_verificados', "Item {$strChave}: observacao invalida.");
                }
                if (isset($mixValor['obs']) && is_string($mixValor['obs']) && strlen($mixValor['obs']) > 2000) {
                    $validator->errors()->add('itens_verificados', "Item {$strChave}: observacao muito longa.");
                }
            }
        });
    }
}

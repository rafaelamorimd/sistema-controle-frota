<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RevisaoChecklistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bolAtualiza = $this->isMethod('put') || $this->isMethod('patch');
        $objItem = $this->route('revisao_checklist_item');
        $numId = $objItem instanceof \App\Models\RevisaoChecklistItem ? $objItem->id : null;
        $bolCategoriaNaRota = $this->route('revisao_categoria') !== null;

        $arrRules = [
            'chave' => [
                ($bolAtualiza ? 'sometimes|' : '').'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('revisao_checklist_itens', 'chave')->ignore($numId),
            ],
            'label' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:255',
            'ordem' => 'nullable|integer|min:0',
        ];

        if ($bolAtualiza) {
            $arrRules['revisao_categoria_id'] = 'sometimes|required|exists:revisao_categorias,id';
        } elseif (! $bolCategoriaNaRota) {
            $arrRules['revisao_categoria_id'] = 'required|exists:revisao_categorias,id';
        }

        return $arrRules;
    }
}

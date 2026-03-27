<?php

namespace App\Http\Requests;

use App\Models\RevisaoCategoria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RevisaoCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bolAtualiza = $this->isMethod('put') || $this->isMethod('patch');

        $objRegraSlugUnico = Rule::unique('revisao_categorias', 'slug');
        $mixParam = $this->route()?->parameter('revisao_categoria');
        if ($bolAtualiza && $mixParam instanceof RevisaoCategoria) {
            $objRegraSlugUnico->ignore($mixParam);
        }

        return [
            'nome' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:120',
            'slug' => [
                ($bolAtualiza ? 'sometimes|' : '').'nullable',
                'string',
                'max:80',
                $objRegraSlugUnico,
            ],
            'ordem' => 'nullable|integer|min:0',
        ];
    }
}

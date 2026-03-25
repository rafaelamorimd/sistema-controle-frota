<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PagamentoRegistrarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comprovante' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'valor' => 'required|numeric|min:0.01',
            'status' => 'required|string|in:PAGO,PENDENTE,ATRASADO',
        ];
    }
}

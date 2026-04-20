<?php

namespace App\Http\Requests;

use App\Enums\StatusPagamento;
use App\Models\Pagamento;
use App\Models\Veiculo;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class LeituraKmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'km' => 'required|integer|min:0',
            'foto' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'contrato_id' => 'prohibited',
            'condutor_id' => 'prohibited',
            'pagamento_id' => 'required|exists:pagamentos,id',
            'observacoes' => 'nullable|string|max:2000',
            'data_leitura' => 'nullable|date',
            'data_referencia' => 'nullable|date',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $objVeiculo = $this->route('veiculo');
            if (! $objVeiculo instanceof Veiculo) {
                return;
            }
            $numPagamentoId = (int) $this->input('pagamento_id', 0);
            if ($numPagamentoId < 1) {
                return;
            }
            $objPagamento = Pagamento::query()->find($numPagamentoId);
            if ($objPagamento === null) {
                return;
            }
            if ((int) $objPagamento->veiculo_id !== (int) $objVeiculo->id) {
                $validator->errors()->add('pagamento_id', 'Pagamento nao pertence a este veiculo.');
            }
            if ($objPagamento->status !== StatusPagamento::PAGO) {
                $validator->errors()->add('pagamento_id', 'Apenas pagamentos PAGO podem ser vinculados.');
            }
        });
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManutencaoRequest extends FormRequest
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
            'tipo' => ($bolAtualiza ? 'sometimes|' : '').'required|string|in:PREVENTIVA,CORRETIVA,PREDITIVA',
            'descricao' => ($bolAtualiza ? 'sometimes|' : '').'required|string|max:5000',
            'data_entrada' => ($bolAtualiza ? 'sometimes|' : '').'required|date',
            'data_saida' => 'nullable|date',
            'km_entrada' => ($bolAtualiza ? 'sometimes|' : '').'required|integer|min:0',
            'custo_total' => 'nullable|numeric|min:0',
            'valor_mao_obra' => 'nullable|numeric|min:0',
            'servicos_externos' => 'nullable|array',
            'servicos_externos.*.descricao' => 'required_with:servicos_externos|string|max:500',
            'servicos_externos.*.valor' => 'required_with:servicos_externos|numeric|min:0',
            'local' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:EM_ANDAMENTO,CONCLUIDA',
            'observacoes' => 'nullable|string|max:5000',
            'itens' => 'nullable|array',
            'itens.*.peca_id' => 'nullable|exists:pecas,id',
            'itens.*.servico_realizado' => 'required_with:itens|string|max:500',
            'itens.*.quantidade' => 'nullable|integer|min:1',
            'itens.*.custo_unitario' => 'required_with:itens|numeric|min:0',
            'itens.*.custo_total' => 'nullable|numeric|min:0',
            'itens.*.baixar_estoque' => 'nullable|boolean',
        ];
    }
}

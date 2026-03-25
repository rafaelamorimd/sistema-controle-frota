<?php

namespace App\Models;

use App\Enums\StatusMulta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Multa extends Model
{
    protected $fillable = [
        'veiculo_id', 'condutor_id', 'contrato_id', 'auto_infracao',
        'data_infracao', 'descricao', 'valor', 'data_vencimento', 'status',
        'indicada_condutor', 'caminho_comprovante', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusMulta::class,
            'data_infracao' => 'datetime',
            'data_vencimento' => 'date',
            'valor' => 'decimal:2',
            'indicada_condutor' => 'boolean',
        ];
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }
}

<?php

namespace App\Models;

use App\Enums\StatusPagamento;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pagamento extends Model
{
    protected $fillable = [
        'contrato_id', 'veiculo_id', 'condutor_id', 'valor', 'data_referencia',
        'status', 'data_pagamento', 'caminho_comprovante', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusPagamento::class,
            'valor' => 'decimal:2',
            'data_referencia' => 'date',
            'data_pagamento' => 'date',
        ];
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }

    public function leituraKm(): HasOne
    {
        return $this->hasOne(LeituraKm::class);
    }
}

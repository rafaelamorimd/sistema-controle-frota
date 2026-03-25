<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManutencaoItem extends Model
{
    protected $table = 'manutencao_itens';

    protected $fillable = [
        'manutencao_id', 'peca_id', 'servico_realizado', 'quantidade',
        'custo_unitario', 'custo_total',
    ];

    protected function casts(): array
    {
        return [
            'custo_unitario' => 'decimal:2',
            'custo_total' => 'decimal:2',
        ];
    }

    public function manutencao(): BelongsTo
    {
        return $this->belongsTo(Manutencao::class);
    }

    public function peca(): BelongsTo
    {
        return $this->belongsTo(Peca::class);
    }
}

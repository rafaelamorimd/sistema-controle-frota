<?php

namespace App\Models;

use App\Enums\TipoMovimentacaoPeca;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimentacaoPeca extends Model
{
    protected $table = 'movimentacoes_pecas';

    protected $fillable = [
        'peca_id', 'tipo', 'quantidade', 'manutencao_id', 'veiculo_id',
        'custo_unitario', 'observacao',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => TipoMovimentacaoPeca::class,
            'custo_unitario' => 'decimal:2',
        ];
    }

    public function peca(): BelongsTo
    {
        return $this->belongsTo(Peca::class);
    }

    public function manutencao(): BelongsTo
    {
        return $this->belongsTo(Manutencao::class);
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }
}

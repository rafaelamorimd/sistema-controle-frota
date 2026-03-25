<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Peca extends Model
{
    protected $table = 'pecas';

    protected $fillable = [
        'nome', 'codigo', 'categoria', 'quantidade_estoque',
        'estoque_minimo', 'custo_medio',
    ];

    protected function casts(): array
    {
        return [
            'custo_medio' => 'decimal:2',
        ];
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(MovimentacaoPeca::class, 'peca_id');
    }
}

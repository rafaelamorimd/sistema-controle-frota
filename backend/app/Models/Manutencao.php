<?php

namespace App\Models;

use App\Enums\StatusManutencao;
use App\Enums\TipoManutencao;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Manutencao extends Model
{
    protected $fillable = [
        'veiculo_id', 'tipo', 'descricao', 'data_entrada', 'data_saida',
        'km_entrada', 'custo_total', 'local', 'status', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => TipoManutencao::class,
            'status' => StatusManutencao::class,
            'data_entrada' => 'date',
            'data_saida' => 'date',
            'custo_total' => 'decimal:2',
        ];
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function itens(): HasMany
    {
        return $this->hasMany(ManutencaoItem::class);
    }

    public function checklistsRevisao(): HasMany
    {
        return $this->hasMany(ChecklistRevisao::class);
    }
}

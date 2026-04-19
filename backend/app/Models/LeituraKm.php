<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeituraKm extends Model
{
    protected $table = 'leituras_km';

    protected $fillable = [
        'veiculo_id', 'contrato_id', 'condutor_id', 'km', 'data_referencia', 'data_leitura',
        'caminho_foto', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'km' => 'integer',
            'data_referencia' => 'date',
            'data_leitura' => 'date',
        ];
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }

    /**
     * Data efetiva da leitura: data_leitura quando preenchida; caso contrario a data de created_at.
     * Evita SQL bruto (DATE()/date()) que difere entre PostgreSQL, MySQL e SQLite.
     *
     * @param  Builder<static>  $query
     */
    public function scopeWhereDataEfetivaLeitura(Builder $query, string $strOperador, string $strData): void
    {
        $query->where(function ($q) use ($strOperador, $strData) {
            $q->where(function ($q2) use ($strOperador, $strData) {
                $q2->whereNotNull('data_leitura')
                    ->whereDate('data_leitura', $strOperador, $strData);
            })->orWhere(function ($q2) use ($strOperador, $strData) {
                $q2->whereNull('data_leitura')
                    ->whereDate('created_at', $strOperador, $strData);
            });
        });
    }
}

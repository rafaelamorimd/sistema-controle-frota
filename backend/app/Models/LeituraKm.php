<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeituraKm extends Model
{
    protected $table = 'leituras_km';

    protected $fillable = [
        'veiculo_id', 'contrato_id', 'condutor_id', 'km', 'caminho_foto', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'km' => 'integer',
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
}

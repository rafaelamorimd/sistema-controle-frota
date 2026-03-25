<?php

namespace App\Models;

use App\Enums\StatusVistoria;
use App\Enums\TipoVistoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vistoria extends Model
{
    protected $fillable = [
        'contrato_id', 'veiculo_id', 'tipo', 'data_vistoria',
        'km_momento', 'nivel_combustivel', 'observacoes', 'status',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => TipoVistoria::class,
            'status' => StatusVistoria::class,
            'data_vistoria' => 'date',
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

    public function itens(): HasMany
    {
        return $this->hasMany(VistoriaItem::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(VistoriaFoto::class);
    }
}

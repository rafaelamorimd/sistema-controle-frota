<?php

namespace App\Models;

use App\Enums\EstadoItemVistoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VistoriaItem extends Model
{
    protected $table = 'vistoria_itens';

    protected $fillable = ['vistoria_id', 'item_verificado', 'estado', 'observacao'];

    protected function casts(): array
    {
        return [
            'estado' => EstadoItemVistoria::class,
        ];
    }

    public function vistoria(): BelongsTo
    {
        return $this->belongsTo(Vistoria::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(VistoriaFoto::class);
    }
}

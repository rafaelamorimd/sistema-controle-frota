<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VistoriaFoto extends Model
{
    protected $fillable = ['vistoria_id', 'vistoria_item_id', 'caminho_arquivo', 'descricao', 'uploaded_at'];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }

    public function vistoria(): BelongsTo
    {
        return $this->belongsTo(Vistoria::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(VistoriaItem::class, 'vistoria_item_id');
    }
}

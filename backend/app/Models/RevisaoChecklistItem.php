<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisaoChecklistItem extends Model
{
    protected $table = 'revisao_checklist_itens';

    protected $fillable = [
        'revisao_categoria_id',
        'chave',
        'label',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'ordem' => 'integer',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(RevisaoCategoria::class, 'revisao_categoria_id');
    }
}

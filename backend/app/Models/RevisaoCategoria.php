<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RevisaoCategoria extends Model
{
    protected $table = 'revisao_categorias';

    protected $fillable = [
        'slug',
        'nome',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'ordem' => 'integer',
        ];
    }

    public function itensChecklist(): HasMany
    {
        return $this->hasMany(RevisaoChecklistItem::class, 'revisao_categoria_id')->orderBy('ordem');
    }
}

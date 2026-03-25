<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistRevisao extends Model
{
    protected $table = 'checklist_revisoes';

    protected $fillable = [
        'veiculo_id', 'manutencao_id', 'data_revisao', 'km_revisao', 'itens_verificados',
    ];

    protected function casts(): array
    {
        return [
            'data_revisao' => 'date',
            'itens_verificados' => 'array',
        ];
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function manutencao(): BelongsTo
    {
        return $this->belongsTo(Manutencao::class);
    }
}

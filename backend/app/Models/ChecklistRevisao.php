<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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

    protected static function booted(): void
    {
        static::deleting(function (ChecklistRevisao $checklist) {
            foreach ($checklist->fotos()->get() as $foto) {
                Storage::disk('public')->delete($foto->caminho_arquivo);
            }
        });
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function manutencao(): BelongsTo
    {
        return $this->belongsTo(Manutencao::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(ChecklistRevisaoFoto::class)->orderBy('id');
    }
}

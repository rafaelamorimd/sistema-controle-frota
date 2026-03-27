<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ChecklistRevisaoFoto extends Model
{
    protected $table = 'checklist_revisao_fotos';

    protected $fillable = [
        'checklist_revisao_id', 'caminho_arquivo',
    ];

    protected $appends = [
        'url',
    ];

    public function checklistRevisao(): BelongsTo
    {
        return $this->belongsTo(ChecklistRevisao::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->caminho_arquivo);
    }
}

<?php

namespace App\Models;

use App\Enums\TipoDocumento;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CondutorDocumento extends Model
{
    protected $fillable = ['condutor_id', 'tipo_documento', 'caminho_arquivo', 'uploaded_at'];

    protected function casts(): array
    {
        return [
            'tipo_documento' => TipoDocumento::class,
            'uploaded_at' => 'datetime',
        ];
    }

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }
}

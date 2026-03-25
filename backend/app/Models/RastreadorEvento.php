<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RastreadorEvento extends Model
{
    protected $table = 'rastreador_eventos';

    protected $fillable = [
        'veiculo_id', 'tipo_evento', 'origem_evento', 'status_comando', 'detalhes',
    ];

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }
}

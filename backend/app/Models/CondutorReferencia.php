<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CondutorReferencia extends Model
{
    protected $fillable = ['condutor_id', 'nome', 'telefone', 'grau_relacionamento'];

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }
}

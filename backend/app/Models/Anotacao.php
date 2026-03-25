<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Anotacao extends Model
{
    protected $table = 'anotacoes';

    protected $fillable = ['entidade_tipo', 'entidade_id', 'texto', 'user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function entidade()
    {
        return $this->morphTo('entidade');
    }
}

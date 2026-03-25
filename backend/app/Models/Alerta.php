<?php

namespace App\Models;

use App\Enums\PrioridadeAlerta;
use App\Enums\TipoAlerta;
use Illuminate\Database\Eloquent\Model;

class Alerta extends Model
{
    protected $fillable = [
        'tipo_alerta', 'entidade_tipo', 'entidade_id',
        'mensagem', 'prioridade', 'lido', 'resolvido', 'resolvido_em',
    ];

    protected function casts(): array
    {
        return [
            'tipo_alerta' => TipoAlerta::class,
            'prioridade' => PrioridadeAlerta::class,
            'lido' => 'boolean',
            'resolvido' => 'boolean',
            'resolvido_em' => 'datetime',
        ];
    }

    public function entidade()
    {
        return $this->morphTo('entidade', 'entidade_tipo', 'entidade_id');
    }

    public function scopeAtivos($query)
    {
        return $query->where('resolvido', false);
    }

    public function scopeNaoLidos($query)
    {
        return $query->where('lido', false);
    }
}

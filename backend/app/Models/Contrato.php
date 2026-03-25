<?php

namespace App\Models;

use App\Enums\StatusContrato;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contrato extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_contrato', 'condutor_id', 'veiculo_id', 'data_inicio',
        'data_fim', 'valor_semanal', 'dia_pagamento', 'caucao', 'status',
        'km_inicial', 'km_final', 'caminho_contrato_pdf',
        'clausulas_adicionais', 'motivo_encerramento',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusContrato::class,
            'data_inicio' => 'date',
            'data_fim' => 'date',
            'valor_semanal' => 'decimal:2',
            'caucao' => 'decimal:2',
        ];
    }

    public function condutor(): BelongsTo
    {
        return $this->belongsTo(Condutor::class);
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function vistorias(): HasMany
    {
        return $this->hasMany(Vistoria::class);
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }

    public function leiturasKm(): HasMany
    {
        return $this->hasMany(LeituraKm::class);
    }

    public function anotacoes()
    {
        return $this->morphMany(Anotacao::class, 'entidade');
    }
}

<?php

namespace App\Models;

use App\Enums\StatusContrato;
use App\Enums\StatusVeiculo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Veiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'placa', 'modelo', 'ano', 'renavam', 'chassi', 'cor',
        'combustivel', 'kit_gas', 'vencimento_gnv', 'km_atual',
        'km_ultima_troca_oleo', 'status', 'numero_rastreador',
        'rastreador_ativo', 'valor_rastreador', 'vencimento_ipva',
        'vencimento_seguro', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusVeiculo::class,
            'kit_gas' => 'boolean',
            'rastreador_ativo' => 'boolean',
            'vencimento_gnv' => 'date',
            'vencimento_ipva' => 'date',
            'vencimento_seguro' => 'date',
            'valor_rastreador' => 'decimal:2',
        ];
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }

    public function contratoAtivo()
    {
        return $this->contratos()->where('status', StatusContrato::ATIVO)->first();
    }

    public function vistorias(): HasMany
    {
        return $this->hasMany(Vistoria::class);
    }

    public function anotacoes()
    {
        return $this->morphMany(Anotacao::class, 'entidade');
    }

    public function alertas()
    {
        return $this->morphMany(Alerta::class, 'entidade');
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }

    public function leiturasKm(): HasMany
    {
        return $this->hasMany(LeituraKm::class);
    }

    public function despesas(): HasMany
    {
        return $this->hasMany(Despesa::class);
    }

    public function manutencoes(): HasMany
    {
        return $this->hasMany(Manutencao::class);
    }

    public function multas(): HasMany
    {
        return $this->hasMany(Multa::class);
    }

    public function checklistsRevisao(): HasMany
    {
        return $this->hasMany(ChecklistRevisao::class);
    }

    public function rastreadorEventos(): HasMany
    {
        return $this->hasMany(RastreadorEvento::class);
    }
}

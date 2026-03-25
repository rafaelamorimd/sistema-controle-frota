<?php

namespace App\Models;

use App\Enums\StatusCondutor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Condutor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'condutores';

    protected $fillable = [
        'nome', 'cpf', 'telefone', 'email', 'endereco',
        'numero_cnh', 'categoria_cnh', 'vencimento_cnh',
        'status', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusCondutor::class,
            'vencimento_cnh' => 'date',
        ];
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(CondutorDocumento::class);
    }

    public function referencias(): HasMany
    {
        return $this->hasMany(CondutorReferencia::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
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

<?php

namespace App\Services;

use App\Enums\StatusVistoria;
use App\Models\Vistoria;
use App\Models\VistoriaFoto;

class VistoriaService
{
    public function criar(array $dados): Vistoria
    {
        return Vistoria::create($dados);
    }

    public function adicionarItens(Vistoria $vistoria, array $itens): Vistoria
    {
        foreach ($itens as $item) {
            $vistoria->itens()->create($item);
        }
        return $vistoria->load('itens');
    }

    public function adicionarFoto(Vistoria $vistoria, $arquivo, ?int $itemId = null, ?string $descricao = null): VistoriaFoto
    {
        $path = $arquivo->store("vistorias/{$vistoria->id}", 'public');

        return $vistoria->fotos()->create([
            'vistoria_item_id' => $itemId,
            'caminho_arquivo' => $path,
            'descricao' => $descricao,
            'uploaded_at' => now(),
        ]);
    }

    public function finalizar(Vistoria $vistoria, int $minimoFotos = 8): Vistoria
    {
        $totalFotos = $vistoria->fotos()->count();

        if ($totalFotos < $minimoFotos) {
            throw new \DomainException("A vistoria precisa de no minimo {$minimoFotos} fotos. Atual: {$totalFotos}.");
        }

        $vistoria->update(['status' => StatusVistoria::FINALIZADA]);
        return $vistoria->fresh(['itens', 'fotos']);
    }
}

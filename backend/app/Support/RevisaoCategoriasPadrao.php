<?php

namespace App\Support;

use App\Models\RevisaoCategoria;
use App\Models\RevisaoChecklistItem;

/**
 * Categorias e itens padrao do checklist de revisao (local, staging e producao).
 * Idempotente: updateOrCreate por slug (categoria) e chave (item).
 */
class RevisaoCategoriasPadrao
{
    /**
     * @return array<int, array{slug: string, nome: string, ordem: int, itens: list<array{chave: string, label: string, ordem: int}>}>
     */
    public static function arrDados(): array
    {
        return [
            [
                'slug' => 'motor',
                'nome' => 'Motor',
                'ordem' => 10,
                'itens' => [
                    ['chave' => 'motor_oleo', 'label' => 'Nível e condição do óleo', 'ordem' => 10],
                    ['chave' => 'motor_correia', 'label' => 'Correia dentada / acessórios', 'ordem' => 20],
                    ['chave' => 'motor_filtro_ar', 'label' => 'Filtro de ar', 'ordem' => 30],
                    ['chave' => 'motor_filtro_combustivel', 'label' => 'Filtro de combustível', 'ordem' => 40],
                ],
            ],
            [
                'slug' => 'pneus',
                'nome' => 'Pneus',
                'ordem' => 20,
                'itens' => [
                    ['chave' => 'pneus_pressao', 'label' => 'Pressão e calibragem', 'ordem' => 10],
                    ['chave' => 'pneus_desgaste', 'label' => 'Desgaste / profundidade', 'ordem' => 20],
                    ['chave' => 'pneus_estepe', 'label' => 'Estepe e ferramentas', 'ordem' => 30],
                ],
            ],
            [
                'slug' => 'freios',
                'nome' => 'Freios',
                'ordem' => 30,
                'itens' => [
                    ['chave' => 'freios_pastilhas', 'label' => 'Pastilhas / lonas', 'ordem' => 10],
                    ['chave' => 'freios_fluido', 'label' => 'Fluido de freio', 'ordem' => 20],
                    ['chave' => 'freios_estacionamento', 'label' => 'Freio de estacionamento', 'ordem' => 30],
                ],
            ],
            [
                'slug' => 'eletrica',
                'nome' => 'Elétrica',
                'ordem' => 40,
                'itens' => [
                    ['chave' => 'eletrica_bateria', 'label' => 'Bateria e terminais', 'ordem' => 10],
                    ['chave' => 'eletrica_farois', 'label' => 'Faróis e lanternas', 'ordem' => 20],
                    ['chave' => 'eletrica_setas', 'label' => 'Setas e luzes de emergência', 'ordem' => 30],
                ],
            ],
            [
                'slug' => 'fluidos',
                'nome' => 'Fluidos',
                'ordem' => 50,
                'itens' => [
                    ['chave' => 'fluidos_radiador', 'label' => 'Água / fluido do arrefecimento', 'ordem' => 10],
                    ['chave' => 'fluidos_direcao', 'label' => 'Fluido da direção hidráulica', 'ordem' => 20],
                    ['chave' => 'fluidos_limpador', 'label' => 'Limpador de para-brisa', 'ordem' => 30],
                ],
            ],
        ];
    }

    public static function sincronizar(): void
    {
        foreach (self::arrDados() as $arrCat) {
            $arrItens = $arrCat['itens'];
            unset($arrCat['itens']);
            $objCat = RevisaoCategoria::updateOrCreate(
                ['slug' => $arrCat['slug']],
                [
                    'nome' => $arrCat['nome'],
                    'ordem' => $arrCat['ordem'],
                ]
            );
            foreach ($arrItens as $arrItem) {
                RevisaoChecklistItem::updateOrCreate(
                    ['chave' => $arrItem['chave']],
                    [
                        'revisao_categoria_id' => $objCat->id,
                        'label' => $arrItem['label'],
                        'ordem' => $arrItem['ordem'],
                    ]
                );
            }
        }
    }
}

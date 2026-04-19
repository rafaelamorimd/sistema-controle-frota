<?php

namespace App\Services;

use App\Enums\StatusDespesa;
use App\Enums\StatusManutencao;
use App\Enums\StatusPagamento;
use App\Models\ChecklistRevisao;
use App\Models\Contrato;
use App\Models\Despesa;
use App\Models\Manutencao;
use App\Models\Pagamento;
use App\Models\RevisaoCategoria;
use App\Models\Veiculo;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RelatorioService
{
    public function __construct(
        private ConfiguracaoService $configuracaoService,
        private CicloContratoService $cicloContratoService,
        private DashboardService $dashboardService
    ) {}

    public function gerarEArmazenarPdfContrato(Contrato $contrato): string
    {
        $contrato->load(['condutor', 'veiculo']);
        $arrLocador = $this->configuracaoService->obterMap();

        $pdf = Pdf::loadView('relatorios.pdf.contrato', [
            'objContrato' => $contrato,
            'arrLocador' => $arrLocador,
        ])->setPaper('a4');

        $strNomeArquivo = $contrato->numero_contrato.'.pdf';
        $strCaminho = 'contratos/'.$strNomeArquivo;

        \Storage::disk('public')->put($strCaminho, $pdf->output());

        return $strCaminho;
    }

    public function pdfContrato(Contrato $contrato): Response
    {
        $contrato->load(['condutor', 'veiculo']);
        $arrLocador = $this->configuracaoService->obterMap();

        $pdf = Pdf::loadView('relatorios.pdf.contrato', [
            'objContrato' => $contrato,
            'arrLocador' => $arrLocador,
        ])->setPaper('a4');

        $strNome = 'contrato-'.$contrato->numero_contrato.'.pdf';

        return $pdf->download($strNome);
    }

    public function pdfFinanceiro(?string $strMes, ?int $numVeiculoId): Response
    {
        $dthMes = $strMes
            ? Carbon::createFromFormat('Y-m', $strMes)->startOfMonth()
            : now()->startOfMonth();

        $dthInicio = $dthMes->copy()->startOfMonth();
        $dthFim = $dthMes->copy()->endOfMonth();

        $queryReceitas = Pagamento::query()
            ->with(['veiculo', 'condutor'])
            ->where('status', StatusPagamento::PAGO)
            ->whereNotNull('data_pagamento')
            ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()]);

        $queryDespesas = Despesa::query()
            ->with('veiculo')
            ->where('status', StatusDespesa::PAGO)
            ->whereNotNull('data_pagamento')
            ->whereBetween('data_pagamento', [$dthInicio->toDateString(), $dthFim->toDateString()]);

        if ($numVeiculoId !== null) {
            $queryReceitas->where('veiculo_id', $numVeiculoId);
            $queryDespesas->where('veiculo_id', $numVeiculoId);
        }

        $arrReceitas = $queryReceitas->orderBy('data_pagamento')->get();
        $arrDespesas = $queryDespesas->orderBy('data_pagamento')->get();

        $numTotalRec = (float) $arrReceitas->sum('valor');
        $numTotalDesp = (float) $arrDespesas->sum('valor');

        $pdf = Pdf::loadView('relatorios.pdf.financeiro', [
            'dthInicio' => $dthInicio,
            'dthFim' => $dthFim,
            'arrReceitas' => $arrReceitas,
            'arrDespesas' => $arrDespesas,
            'numTotalReceitas' => $numTotalRec,
            'numTotalDespesas' => $numTotalDesp,
            'numRendaLiquida' => $numTotalRec - $numTotalDesp,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('resumo-financeiro-'.$dthInicio->format('Y-m').'.pdf');
    }

    public function pdfFrotaConsolidado(?string $strMes, ?int $numVeiculoId): Response
    {
        $arrRenda = $this->dashboardService->rendaLiquida($strMes, $numVeiculoId);

        $dthMes = $strMes
            ? Carbon::createFromFormat('Y-m', $strMes)->startOfMonth()
            : now()->startOfMonth();

        $dthInicio = $dthMes->copy()->startOfMonth();
        $dthFim = $dthMes->copy()->endOfMonth();

        $arrPorVeiculo = [];

        if ($numVeiculoId !== null) {
            $objVeiculo = Veiculo::find($numVeiculoId);
            $arrPorVeiculo[] = [
                'strPlaca' => $objVeiculo?->placa ?? '-',
                'numReceitas' => $arrRenda['receitas_pagas'],
                'numDespesas' => $arrRenda['despesas_pagas'],
                'numLiquido' => $arrRenda['renda_liquida'],
            ];
        } else {
            foreach ($arrRenda['por_veiculo'] as $row) {
                $objVeiculo = Veiculo::find($row['veiculo_id']);
                $arrPorVeiculo[] = [
                    'strPlaca' => $objVeiculo?->placa ?? '#'.$row['veiculo_id'],
                    'numReceitas' => $row['receitas_pagas'],
                    'numDespesas' => $row['despesas_pagas'],
                    'numLiquido' => $row['renda_liquida'],
                ];
            }
        }

        $pdf = Pdf::loadView('relatorios.pdf.frota_mes', [
            'dthInicio' => $dthInicio,
            'dthFim' => $dthFim,
            'arrPorVeiculo' => $arrPorVeiculo,
            'numTotalReceitas' => $arrRenda['receitas_pagas'],
            'numTotalDespesas' => $arrRenda['despesas_pagas'],
            'numRendaLiquida' => $arrRenda['renda_liquida'],
        ])->setPaper('a4', 'landscape');

        return $pdf->download('frota-'.$dthInicio->format('Y-m').'.pdf');
    }

    public function pdfDesempenhoPrimeiroCiclo(Contrato $objContrato): Response
    {
        $objContrato->load(['condutor', 'veiculo']);

        $arrResumo = $this->cicloContratoService->obterResumoPrimeiroCicloQuatroSemanas($objContrato);

        $arrDespesas = collect();
        $arrManutencoes = collect();
        $numTotalReceitasCiclo = 0.0;
        $numTotalDespesas = 0.0;
        $numTotalManutencoes = 0.0;

        if ($arrResumo !== null) {
            $dthInicio = $arrResumo['dth_inicio'];
            $dthFim = $arrResumo['dth_fim_ciclo'];
            $strInicio = $dthInicio->toDateString();
            $strFim = $dthFim->toDateString();

            $numTotalReceitasCiclo = (float) $arrResumo['arr_pagamentos_ciclo']->sum('valor');

            $arrDespesas = Despesa::query()
                ->with('veiculo')
                ->where('veiculo_id', $objContrato->veiculo_id)
                ->where('status', StatusDespesa::PAGO)
                ->whereNotNull('data_pagamento')
                ->whereBetween('data_pagamento', [$strInicio, $strFim])
                ->orderBy('data_pagamento')
                ->get();

            $numTotalDespesas = (float) $arrDespesas->sum('valor');

            $arrManutencoes = Manutencao::query()
                ->where('veiculo_id', $objContrato->veiculo_id)
                ->where('status', StatusManutencao::CONCLUIDA)
                ->where(function ($q) use ($strInicio, $strFim) {
                    $q->whereBetween('data_entrada', [$strInicio, $strFim])
                        ->orWhereBetween('data_saida', [$strInicio, $strFim]);
                })
                ->with('itens.peca')
                ->orderBy('data_entrada')
                ->get();

            $numTotalManutencoes = (float) $arrManutencoes->sum(fn (Manutencao $m) => (float) $m->custo_total);
        }

        $numResultadoLiquido = $numTotalReceitasCiclo - $numTotalDespesas - $numTotalManutencoes;
        $numPctMargem = $numTotalReceitasCiclo > 0.01
            ? round(($numResultadoLiquido / $numTotalReceitasCiclo) * 100, 1)
            : null;

        $pdf = Pdf::loadView('relatorios.pdf.desempenho_veiculo', [
            'objContrato' => $objContrato,
            'arrResumo' => $arrResumo,
            'arrDespesas' => $arrDespesas,
            'arrManutencoes' => $arrManutencoes,
            'numTotalReceitasCiclo' => $numTotalReceitasCiclo,
            'numTotalDespesas' => $numTotalDespesas,
            'numTotalManutencoes' => $numTotalManutencoes,
            'numResultadoLiquido' => $numResultadoLiquido,
            'numPctMargem' => $numPctMargem,
        ])->setPaper('a4');

        $strNome = 'desempenho-'.$objContrato->numero_contrato.'.pdf';

        return $pdf->download($strNome);
    }

    public function pdfChecklistRevisao(ChecklistRevisao $checklist): Response
    {
        $checklist->load('veiculo');
        $arrValores = is_array($checklist->itens_verificados) ? $checklist->itens_verificados : [];
        $arrRestantes = $arrValores;

        $arrLinhas = [];
        $arrCategorias = RevisaoCategoria::query()
            ->with(['itensChecklist' => fn ($q) => $q->orderBy('ordem')])
            ->orderBy('ordem')
            ->orderBy('nome')
            ->get();

        foreach ($arrCategorias as $objCat) {
            foreach ($objCat->itensChecklist as $objItem) {
                if (! array_key_exists($objItem->chave, $arrRestantes)) {
                    continue;
                }
                $mixV = $arrRestantes[$objItem->chave];
                unset($arrRestantes[$objItem->chave]);
                $arrLinhas[] = [
                    'strCategoria' => $objCat->nome,
                    'strLabel' => $objItem->label,
                    'strChave' => $objItem->chave,
                    'strStatus' => $this->strStatusChecklistParaPdf($mixV),
                    'strObs' => $this->strObsChecklistParaPdf($mixV),
                ];
            }
        }

        foreach ($arrRestantes as $strChave => $mixV) {
            $arrLinhas[] = [
                'strCategoria' => 'Outros',
                'strLabel' => $strChave,
                'strChave' => $strChave,
                'strStatus' => $this->strStatusChecklistParaPdf($mixV),
                'strObs' => $this->strObsChecklistParaPdf($mixV),
            ];
        }

        $pdf = Pdf::loadView('relatorios.pdf.checklist_revisao', [
            'objChecklist' => $checklist,
            'arrLinhas' => $arrLinhas,
        ])->setPaper('a4');

        $strNome = 'checklist-revisao-'.$checklist->id.'-'.$checklist->data_revisao->format('Y-m-d').'.pdf';

        return $pdf->download($strNome);
    }

    private function strStatusChecklistParaPdf(mixed $mixV): string
    {
        if (is_string($mixV)) {
            return match (strtolower($mixV)) {
                'ok' => 'OK',
                'verificar' => 'Verificar',
                'trocar' => 'Trocar / defeito',
                default => $mixV,
            };
        }
        if (is_array($mixV) && isset($mixV['status'])) {
            return match ($mixV['status']) {
                'ok' => 'OK',
                'verificar' => 'Verificar',
                'trocar' => 'Trocar / defeito',
                default => (string) $mixV['status'],
            };
        }

        return '—';
    }

    private function strObsChecklistParaPdf(mixed $mixV): string
    {
        if (is_array($mixV) && ! empty($mixV['obs']) && is_string($mixV['obs'])) {
            return $mixV['obs'];
        }

        return '';
    }

    public function csvVeiculos(): StreamedResponse
    {
        $arrVeiculos = Veiculo::orderBy('placa')->get();

        $strNome = 'veiculos-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($arrVeiculos) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($out, ['Placa', 'Modelo', 'Ano', 'Status', 'Km atual', 'IPVA', 'Seguro'], ';');

            foreach ($arrVeiculos as $v) {
                fputcsv($out, [
                    $v->placa,
                    $v->modelo,
                    $v->ano,
                    $v->status->value,
                    $v->km_atual,
                    optional($v->vencimento_ipva)?->format('Y-m-d'),
                    optional($v->vencimento_seguro)?->format('Y-m-d'),
                ], ';');
            }

            fclose($out);
        }, $strNome, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function excelVeiculos(): StreamedResponse
    {
        $arrVeiculos = Veiculo::orderBy('placa')->get();

        $arrLinhas = [
            ['Placa', 'Modelo', 'Ano', 'Status', 'Km atual', 'IPVA', 'Seguro'],
        ];

        foreach ($arrVeiculos as $v) {
            $arrLinhas[] = [
                $v->placa,
                $v->modelo,
                $v->ano,
                $v->status->value,
                $v->km_atual,
                optional($v->vencimento_ipva)?->format('Y-m-d'),
                optional($v->vencimento_seguro)?->format('Y-m-d'),
            ];
        }

        $strNome = 'veiculos-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($arrLinhas) {
            $objPlanilha = new Spreadsheet;
            $objPlanilha->getActiveSheet()->fromArray($arrLinhas, null, 'A1');
            $objWriter = new Xlsx($objPlanilha);
            $objWriter->save('php://output');
        }, $strNome, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}

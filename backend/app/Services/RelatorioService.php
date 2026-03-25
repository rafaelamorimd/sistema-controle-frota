<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\Despesa;
use App\Models\Pagamento;
use App\Models\Veiculo;
use App\Enums\StatusDespesa;
use App\Enums\StatusPagamento;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RelatorioService
{
    public function pdfContrato(Contrato $contrato): Response
    {
        $contrato->load(['condutor', 'veiculo']);

        $pdf = Pdf::loadView('relatorios.pdf.contrato', ['objContrato' => $contrato])
            ->setPaper('a4');

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
            $objPlanilha = new Spreadsheet();
            $objPlanilha->getActiveSheet()->fromArray($arrLinhas, null, 'A1');
            $objWriter = new Xlsx($objPlanilha);
            $objWriter->save('php://output');
        }, $strNome, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}

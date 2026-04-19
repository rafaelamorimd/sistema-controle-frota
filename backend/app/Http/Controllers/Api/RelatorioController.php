<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChecklistRevisao;
use App\Models\Contrato;
use App\Services\RelatorioService;
use Illuminate\Http\Request;

class RelatorioController extends Controller
{
    public function __construct(private RelatorioService $service) {}

    public function pdfContrato(Contrato $contrato)
    {
        return $this->service->pdfContrato($contrato);
    }

    public function pdfDesempenhoPrimeiroCiclo(Contrato $contrato)
    {
        return $this->service->pdfDesempenhoPrimeiroCiclo($contrato);
    }

    public function pdfChecklistRevisao(ChecklistRevisao $checklist_revisao)
    {
        return $this->service->pdfChecklistRevisao($checklist_revisao);
    }

    public function pdfFinanceiro(Request $request)
    {
        $request->validate([
            'mes' => 'nullable|date_format:Y-m',
            'veiculo_id' => 'nullable|integer|exists:veiculos,id',
        ]);

        $strMes = $request->query('mes');
        $numVeiculoId = $request->query('veiculo_id');

        return $this->service->pdfFinanceiro(
            $strMes,
            $numVeiculoId !== null ? (int) $numVeiculoId : null
        );
    }

    public function csvVeiculos()
    {
        return $this->service->csvVeiculos();
    }

    public function excelVeiculos()
    {
        return $this->service->excelVeiculos();
    }
}

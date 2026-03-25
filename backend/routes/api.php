<?php

use App\Http\Controllers\Api\AlertaController;
use App\Http\Controllers\Api\AnotacaoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChecklistRevisaoController;
use App\Http\Controllers\Api\CondutorController;
use App\Http\Controllers\Api\ContratoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DespesaController;
use App\Http\Controllers\Api\LeituraKmController;
use App\Http\Controllers\Api\ManutencaoController;
use App\Http\Controllers\Api\MovimentacaoPecaController;
use App\Http\Controllers\Api\MultaController;
use App\Http\Controllers\Api\PagamentoController;
use App\Http\Controllers\Api\PecaController;
use App\Http\Controllers\Api\RastreadorController;
use App\Http\Controllers\Api\RelatorioController;
use App\Http\Controllers\Api\VeiculoController;
use App\Http\Controllers\Api\VistoriaController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('veiculos', VeiculoController::class);
    Route::patch('veiculos/{veiculo}/status', [VeiculoController::class, 'alterarStatus']);

    Route::apiResource('condutores', CondutorController::class);
    Route::post('condutores/{condutor}/documentos', [CondutorController::class, 'uploadDocumento']);
    Route::delete('condutores/{condutor}/documentos/{documento}', [CondutorController::class, 'removerDocumento']);
    Route::post('condutores/{condutor}/referencias', [CondutorController::class, 'adicionarReferencia']);
    Route::put('condutores/{condutor}/referencias/{referencia}', [CondutorController::class, 'atualizarReferencia']);

    Route::apiResource('contratos', ContratoController::class);
    Route::patch('contratos/{contrato}/encerrar', [ContratoController::class, 'encerrar']);

    Route::get('dashboard/resumo', [DashboardController::class, 'resumo']);
    Route::get('dashboard/renda-liquida', [DashboardController::class, 'rendaLiquida']);
    Route::get('dashboard/alertas', [DashboardController::class, 'alertas']);

    Route::get('pagamentos/inadimplentes', [PagamentoController::class, 'inadimplentes']);
    Route::get('pagamentos', [PagamentoController::class, 'index']);
    Route::post('pagamentos/{pagamento}/registrar', [PagamentoController::class, 'registrar']);
    Route::get('contratos/{contrato}/pagamentos', [PagamentoController::class, 'indexPorContrato']);

    Route::get('veiculos/{veiculo}/leituras-km', [LeituraKmController::class, 'index']);
    Route::post('veiculos/{veiculo}/leituras-km', [LeituraKmController::class, 'store']);

    Route::get('veiculos/{veiculo}/despesas', [DespesaController::class, 'indexPorVeiculo']);
    Route::get('despesas', [DespesaController::class, 'index']);
    Route::post('despesas', [DespesaController::class, 'store']);
    Route::put('despesas/{despesa}', [DespesaController::class, 'update']);
    Route::patch('despesas/{despesa}/pagar', [DespesaController::class, 'pagar']);

    Route::get('contratos/{contrato}/vistorias', [VistoriaController::class, 'index']);
    Route::post('vistorias', [VistoriaController::class, 'store']);
    Route::get('vistorias/{vistoria}', [VistoriaController::class, 'show']);
    Route::post('vistorias/{vistoria}/itens', [VistoriaController::class, 'adicionarItens']);
    Route::post('vistorias/{vistoria}/fotos', [VistoriaController::class, 'uploadFoto']);
    Route::patch('vistorias/{vistoria}/finalizar', [VistoriaController::class, 'finalizar']);

    Route::get('alertas', [AlertaController::class, 'index']);
    Route::patch('alertas/{alerta}/lido', [AlertaController::class, 'marcarLido']);
    Route::patch('alertas/{alerta}/resolver', [AlertaController::class, 'resolver']);

    Route::get('relatorios/contrato/{contrato}/pdf', [RelatorioController::class, 'pdfContrato']);
    Route::get('relatorios/financeiro/pdf', [RelatorioController::class, 'pdfFinanceiro']);
    Route::get('relatorios/veiculos/csv', [RelatorioController::class, 'csvVeiculos']);
    Route::get('relatorios/veiculos/excel', [RelatorioController::class, 'excelVeiculos']);

    Route::post('pecas/{peca}/movimentacoes', [MovimentacaoPecaController::class, 'store']);
    Route::apiResource('pecas', PecaController::class);

    Route::post('manutencoes/{manutencao}/itens', [ManutencaoController::class, 'storeItem']);
    Route::put('manutencoes/{manutencao}/itens/{manutencao_item}', [ManutencaoController::class, 'updateItem']);
    Route::delete('manutencoes/{manutencao}/itens/{manutencao_item}', [ManutencaoController::class, 'destroyItem']);
    Route::patch('manutencoes/{manutencao}/concluir', [ManutencaoController::class, 'concluir']);
    Route::apiResource('manutencoes', ManutencaoController::class)
        ->parameters(['manutencoes' => 'manutencao']);

    Route::get('veiculos/{veiculo}/checklist-revisoes', [ChecklistRevisaoController::class, 'indexPorVeiculo']);
    Route::post('checklist-revisoes', [ChecklistRevisaoController::class, 'store']);
    Route::put('checklist-revisoes/{checklist_revisao}', [ChecklistRevisaoController::class, 'update']);
    Route::delete('checklist-revisoes/{checklist_revisao}', [ChecklistRevisaoController::class, 'destroy']);

    Route::get('veiculos/{veiculo}/multas', [MultaController::class, 'indexPorVeiculo']);
    Route::patch('multas/{multa}/pagar', [MultaController::class, 'marcarPaga']);
    Route::apiResource('multas', MultaController::class);

    Route::get('veiculos/{veiculo}/rastreador/eventos', [RastreadorController::class, 'eventos']);
    Route::post('veiculos/{veiculo}/rastreador/sincronizar', [RastreadorController::class, 'sincronizar']);

    Route::get('{entidadeTipo}/{entidadeId}/anotacoes', [AnotacaoController::class, 'index'])
        ->whereIn('entidadeTipo', ['veiculos', 'condutores', 'contratos']);
    Route::post('{entidadeTipo}/{entidadeId}/anotacoes', [AnotacaoController::class, 'store'])
        ->whereIn('entidadeTipo', ['veiculos', 'condutores', 'contratos']);
});

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Desempenho — {{ $objContrato->numero_contrato }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#111; }
        h1 { font-size:14px; margin:0 0 6px 0; }
        h2 { font-size:11px; margin:12px 0 6px 0; border-bottom:1px solid #ccc; padding-bottom:2px; }
        table { width:100%; border-collapse:collapse; margin-top:4px; }
        th, td { border:1px solid #ccc; padding:4px 6px; text-align:left; }
        th { background:#f0f0f0; }
        .right { text-align:right; }
        .totais { margin-top:8px; font-weight:bold; }
        .muted { color:#666; font-size:8px; margin-top:12px; }
        .alerta { background:#fff8e6; border:1px solid #e6d08a; padding:8px; margin-bottom:10px; }
    </style>
</head>
<body>
    @if($arrResumo === null)
        <div class="alerta">
            Não foi possível montar o 1º ciclo de 4 semanas: é necessário ter ao menos <strong>5 pagamentos</strong> cadastrados para este contrato (semanais a partir da data de início).
        </div>
    @endif

    <h1>Relatório de desempenho — 1º ciclo (4 semanas)</h1>
    @if($arrResumo !== null)
        <p>Período: {{ $arrResumo['dth_inicio']->format('d/m/Y') }} a {{ $arrResumo['dth_fim_ciclo']->format('d/m/Y') }}</p>
    @endif

    <p>
        <strong>Veículo:</strong> {{ $objContrato->veiculo->placa ?? '—' }}
        — {{ $objContrato->veiculo->modelo ?? '' }} {{ $objContrato->veiculo->ano ?? '' }}
        @if($objContrato->veiculo->cor ?? false) — {{ $objContrato->veiculo->cor }} @endif
        <br>
        <strong>Condutor:</strong> {{ $objContrato->condutor->nome ?? '—' }}
        <br>
        <strong>CPF:</strong> {{ $objContrato->condutor->cpf ?? '—' }}
        <br>
        <strong>Contrato:</strong> {{ $objContrato->numero_contrato }}
    </p>

    @if($arrResumo !== null)
        <h2>Pagamentos do ciclo (referência)</h2>
        <table>
            <tr><th>#</th><th>Data referência</th><th>Status</th><th class="right">Valor</th></tr>
            @foreach($arrResumo['arr_pagamentos_ciclo'] as $objPagamento)
                <tr>
                    <td>{{ $loop->iteration }}º</td>
                    <td>{{ $objPagamento->data_referencia->format('d/m/Y') }}</td>
                    <td>{{ $objPagamento->status->value }}</td>
                    <td class="right">R$ {{ number_format((float) $objPagamento->valor, 2, ',', '.') }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="3" class="right">Total</td>
                <td class="right">R$ {{ number_format($numTotalReceitasCiclo, 2, ',', '.') }}</td>
            </tr>
        </table>

        <h2>Quilometragem</h2>
        <p>
            KM inicial ({{ $arrResumo['dth_inicio']->format('d/m/Y') }}): <strong>{{ number_format($arrResumo['num_km_inicial'], 0, ',', '.') }} km</strong><br>
            @if($arrResumo['num_km_final'] !== null)
                KM no fim do ciclo (até {{ $arrResumo['dth_fim_ciclo']->format('d/m/Y') }}): <strong>{{ number_format($arrResumo['num_km_final'], 0, ',', '.') }} km</strong><br>
            @else
                KM no fim do ciclo: <em>sem leitura registrada até a data do 5º pagamento</em><br>
            @endif
            @if($arrResumo['num_km_rodado'] !== null)
                KM rodados no período: <strong>{{ number_format($arrResumo['num_km_rodado'], 0, ',', '.') }} km</strong><br>
                Média semanal (estimada): <strong>{{ number_format($arrResumo['num_km_rodado'] / 4, 0, ',', '.') }} km/semana</strong><br>
                Meta (5.000 km / 4 semanas):
                @if($arrResumo['num_km_rodado'] <= 5000)
                    dentro da meta
                @else
                    acima da meta
                @endif
            @endif
        </p>

        <h2>Despesas do período (pagas)</h2>
        @if($arrDespesas->isEmpty())
            <p>Nenhuma despesa paga neste intervalo.</p>
        @else
            <table>
                <tr><th>Data</th><th>Descrição</th><th class="right">Valor</th></tr>
                @foreach($arrDespesas as $d)
                    <tr>
                        <td>{{ $d->data_pagamento?->format('d/m/Y') }}</td>
                        <td>{{ $d->descricao }}</td>
                        <td class="right">R$ {{ number_format((float) $d->valor, 2, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr>
                    <td colspan="2" class="right">Total</td>
                    <td class="right">R$ {{ number_format($numTotalDespesas, 2, ',', '.') }}</td>
                </tr>
            </table>
        @endif

        <h2>Manutenções concluídas (entrada ou saída no período)</h2>
        @if($arrManutencoes->isEmpty())
            <p>Nenhuma manutenção concluída neste intervalo.</p>
        @else
            @foreach($arrManutencoes as $objOs)
                <p style="margin:6px 0 2px 0;">
                    <strong>OS #{{ $objOs->id }}</strong> — {{ $objOs->data_entrada->format('d/m/Y') }}
                    @if($objOs->data_saida) — saída {{ $objOs->data_saida->format('d/m/Y') }} @endif
                    — {{ $objOs->tipo->value }} — KM {{ number_format($objOs->km_entrada, 0, ',', '.') }}
                </p>
                @if($objOs->itens->isNotEmpty())
                    <table>
                        <tr><th>Item</th><th class="right">Custo</th></tr>
                        @foreach($objOs->itens as $objItem)
                            <tr>
                                <td>{{ $objItem->servico_realizado }}</td>
                                <td class="right">R$ {{ number_format((float) $objItem->custo_total, 2, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </table>
                @endif
                <p>Subtotal OS: <strong>R$ {{ number_format((float) $objOs->custo_total, 2, ',', '.') }}</strong></p>
            @endforeach
            <p class="totais">Total manutenções: R$ {{ number_format($numTotalManutencoes, 2, ',', '.') }}</p>
        @endif

        <h2>Resumo financeiro (ciclo)</h2>
        <p>
            (+) Recebimentos (soma dos 5 pagamentos do ciclo): R$ {{ number_format($numTotalReceitasCiclo, 2, ',', '.') }}<br>
            (-) Despesas operacionais pagas: R$ {{ number_format($numTotalDespesas, 2, ',', '.') }}<br>
            (-) Manutenções (concluídas): R$ {{ number_format($numTotalManutencoes, 2, ',', '.') }}<br>
            <strong>Resultado líquido: R$ {{ number_format($numResultadoLiquido, 2, ',', '.') }}</strong>
            @if($numPctMargem !== null)
                <br>Margem sobre receitas do ciclo: {{ number_format($numPctMargem, 1, ',', '.') }}%
            @endif
        </p>
    @endif

    <p class="muted">Gefther — {{ now()->format('d/m/Y H:i') }} — Cálculo de KM conforme 5º pagamento semanal e leituras até essa data.</p>
</body>
</html>

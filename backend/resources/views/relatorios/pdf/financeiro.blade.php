<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resumo financeiro</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; }
        h1 { font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #ccc; padding: 4px 6px; }
        th { background: #f0f0f0; }
        .totais { margin-top: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Resumo financeiro {{ $dthInicio->format('m/Y') }}</h1>
    <p>Periodo: {{ $dthInicio->format('d/m/Y') }} a {{ $dthFim->format('d/m/Y') }}</p>
    <p class="totais">
        Receitas: R$ {{ number_format($numTotalReceitas, 2, ',', '.') }} |
        Despesas: R$ {{ number_format($numTotalDespesas, 2, ',', '.') }} |
        Renda liquida: R$ {{ number_format($numRendaLiquida, 2, ',', '.') }}
    </p>
    <h2 style="font-size:12px;margin-top:10px;">Receitas pagas</h2>
    <table>
        <tr><th>Data</th><th>Veiculo</th><th>Condutor</th><th>Valor</th></tr>
        @foreach($arrReceitas as $r)
            <tr>
                <td>{{ $r->data_pagamento?->format('d/m/Y') }}</td>
                <td>{{ $r->veiculo->placa ?? '-' }}</td>
                <td>{{ $r->condutor->nome ?? '-' }}</td>
                <td>R$ {{ number_format((float) $r->valor, 2, ',', '.') }}</td>
            </tr>
        @endforeach
    </table>
    <h2 style="font-size:12px;margin-top:10px;">Despesas pagas</h2>
    <table>
        <tr><th>Data</th><th>Veiculo</th><th>Descricao</th><th>Valor</th></tr>
        @foreach($arrDespesas as $d)
            <tr>
                <td>{{ $d->data_pagamento?->format('d/m/Y') }}</td>
                <td>{{ $d->veiculo->placa ?? '-' }}</td>
                <td>{{ $d->descricao }}</td>
                <td>R$ {{ number_format((float) $d->valor, 2, ',', '.') }}</td>
            </tr>
        @endforeach
    </table>
    <p style="margin-top:16px;color:#666;font-size:8px;">Gefther — {{ now()->format('d/m/Y H:i') }}</p>
</body>
</html>

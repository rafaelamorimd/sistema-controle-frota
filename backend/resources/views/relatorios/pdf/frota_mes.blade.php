<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Frota — renda por veículo</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; }
        h1 { font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: left; }
        th { background: #f0f0f0; }
        .num { text-align: right; }
        .totais { margin-top: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Renda por veículo — {{ $dthInicio->format('m/Y') }}</h1>
    <p>Período: {{ $dthInicio->format('d/m/Y') }} a {{ $dthFim->format('d/m/Y') }}</p>
    <p class="totais">
        Receitas: R$ {{ number_format($numTotalReceitas, 2, ',', '.') }} |
        Despesas: R$ {{ number_format($numTotalDespesas, 2, ',', '.') }} |
        Líquido: R$ {{ number_format($numRendaLiquida, 2, ',', '.') }}
    </p>
    <h2 style="font-size:12px;margin-top:12px;">Por veículo</h2>
    <table>
        <tr>
            <th>Veículo</th>
            <th class="num">Receitas pagas</th>
            <th class="num">Despesas pagas</th>
            <th class="num">Renda líquida</th>
        </tr>
        @forelse($arrPorVeiculo as $linha)
            <tr>
                <td>{{ $linha['strPlaca'] }}</td>
                <td class="num">R$ {{ number_format($linha['numReceitas'], 2, ',', '.') }}</td>
                <td class="num">R$ {{ number_format($linha['numDespesas'], 2, ',', '.') }}</td>
                <td class="num">R$ {{ number_format($linha['numLiquido'], 2, ',', '.') }}</td>
            </tr>
        @empty
            <tr><td colspan="4">Nenhum movimento no período.</td></tr>
        @endforelse
    </table>
    <p style="margin-top:16px;color:#666;font-size:8px;">Gefther — {{ now()->format('d/m/Y H:i') }}</p>
</body>
</html>

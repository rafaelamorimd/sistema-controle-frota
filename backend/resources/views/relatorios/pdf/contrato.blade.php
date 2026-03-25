<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contrato {{ $objContrato->numero_contrato }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 16px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Contrato {{ $objContrato->numero_contrato }}</h1>
    <p><strong>Status:</strong> {{ $objContrato->status->value }}</p>
    <p><strong>Periodo:</strong>
        {{ $objContrato->data_inicio->format('d/m/Y') }}
        @if($objContrato->data_fim)
            a {{ $objContrato->data_fim->format('d/m/Y') }}
        @endif
    </p>
    <table>
        <tr><th>Condutor</th><td>{{ $objContrato->condutor->nome ?? '-' }}</td></tr>
        <tr><th>Veiculo</th><td>{{ $objContrato->veiculo->placa ?? '-' }} — {{ $objContrato->veiculo->modelo ?? '' }}</td></tr>
        <tr><th>Valor semanal</th><td>R$ {{ number_format((float) $objContrato->valor_semanal, 2, ',', '.') }}</td></tr>
        <tr><th>Dia pagamento</th><td>{{ $objContrato->dia_pagamento ?? '-' }}</td></tr>
        <tr><th>Caucao</th><td>R$ {{ number_format((float) ($objContrato->caucao ?? 0), 2, ',', '.') }}</td></tr>
        <tr><th>Km inicial</th><td>{{ $objContrato->km_inicial ?? '-' }}</td></tr>
    </table>
    @if($objContrato->clausulas_adicionais)
        <h2 style="margin-top:16px;font-size:13px;">Clausulas adicionais</h2>
        <p style="white-space: pre-wrap;">{{ $objContrato->clausulas_adicionais }}</p>
    @endif
    <p style="margin-top:24px;color:#666;font-size:9px;">Emitido em {{ now()->format('d/m/Y H:i') }} — Gefther</p>
</body>
</html>

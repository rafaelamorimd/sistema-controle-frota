<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Checklist de revisão</title>
    <style>
        @page { margin: 1.8cm 1.5cm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9.5pt; line-height: 1.35; color: #111; }
        h1 { font-size: 14pt; margin: 0 0 12px 0; color: #1a1a2e; }
        .meta { margin-bottom: 14px; font-size: 9pt; color: #444; }
        .meta strong { color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
        th { background: #f0f2f7; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.03em; }
        td.str-chave { font-size: 8pt; color: #666; font-family: DejaVu Sans Mono, monospace; }
        .status-ok { color: #166534; font-weight: bold; }
        .status-att { color: #a16207; font-weight: bold; }
        .status-def { color: #991b1b; font-weight: bold; }
        .rodape { margin-top: 16px; font-size: 8pt; color: #666; }
    </style>
</head>
<body>
    <h1>Checklist de revisão</h1>
    <div class="meta">
        <strong>Veículo:</strong> {{ $objChecklist->veiculo->placa ?? '—' }} — {{ $objChecklist->veiculo->modelo ?? '' }}<br>
        <strong>Data da revisão:</strong> {{ $objChecklist->data_revisao->format('d/m/Y') }} &nbsp;|&nbsp;
        <strong>Km:</strong> {{ number_format($objChecklist->km_revisao, 0, ',', '.') }} km
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:18%">Categoria</th>
                <th style="width:32%">Item</th>
                <th style="width:14%">Situação</th>
                <th style="width:36%">Observação</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($arrLinhas as $arrLinha)
                @php
                    $strS = $arrLinha['strStatus'];
                    $strClasse = 'status-att';
                    if ($strS === 'OK') $strClasse = 'status-ok';
                    elseif (str_contains($strS, 'Trocar') || str_contains($strS, 'defeito')) $strClasse = 'status-def';
                @endphp
                <tr>
                    <td>{{ $arrLinha['strCategoria'] }}</td>
                    <td>
                        {{ $arrLinha['strLabel'] }}
                        <div class="str-chave">{{ $arrLinha['strChave'] }}</div>
                    </td>
                    <td class="{{ $strClasse }}">{{ $arrLinha['strStatus'] }}</td>
                    <td>{{ $arrLinha['strObs'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p class="rodape">Documento gerado em {{ now()->format('d/m/Y H:i') }} — Gefther</p>
</body>
</html>

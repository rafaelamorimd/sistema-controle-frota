<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contrato de Locação {{ $objContrato->numero_contrato }}</title>
    <style>
        @page { margin: 2cm 1.5cm; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }
        h1 {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 16px 0;
            text-transform: uppercase;
        }
        h2 {
            font-size: 11pt;
            font-weight: bold;
            margin: 12px 0 6px 0;
        }
        p {
            margin: 6px 0;
            text-align: justify;
        }
        .clausula {
            margin: 10px 0;
        }
        .clausula-titulo {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .assinatura {
            margin-top: 40px;
            text-align: center;
        }
        .assinatura-linha {
            border-top: 1px solid #000;
            width: 250px;
            margin: 0 auto 4px auto;
        }
        .page-break {
            page-break-after: always;
        }
        ul {
            margin: 4px 0;
            padding-left: 20px;
        }
        li {
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <h1>Contrato de Locação de Veículo</h1>

    <h2>LOCADOR:</h2>
    <p>
        <strong>Nome:</strong> {{ $arrLocador['locador_nome'] ?? '___________________________' }}<br>
        <strong>CPF:</strong> {{ $arrLocador['locador_cpf'] ?? '___________________________' }}<br>
        <strong>Endereço:</strong> {{ $arrLocador['locador_endereco'] ?? '___________________________' }}
    </p>

    <h2>LOCATÁRIO:</h2>
    <p>
        <strong>Nome:</strong> {{ $objContrato->condutor->nome ?? '___________________________' }}<br>
        <strong>CPF:</strong> {{ $objContrato->condutor->cpf ?? '___________________________' }}<br>
        <strong>Endereço:</strong> {{ $objContrato->condutor->endereco ?? '___________________________' }}
    </p>

    <h2>OBJETO DO CONTRATO:</h2>
    <p>
        <strong>Veículo:</strong> {{ $objContrato->veiculo->modelo ?? '___________________________' }}<br>
        <strong>Ano:</strong> {{ $objContrato->veiculo->ano ?? '____' }}<br>
        <strong>Cor:</strong> {{ $objContrato->veiculo->cor ?? '___________________________' }}<br>
        <strong>Placa:</strong> {{ $objContrato->veiculo->placa ?? '___________________________' }}<br>
        <strong>RENAVAM:</strong> {{ $objContrato->veiculo->renavam ?? '___________________________' }}
    </p>

    <h2>CONDIÇÕES:</h2>
    <p>
        <strong>Data de Início:</strong> {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('d/m/Y') : '___/___/______' }}<br>
        <strong>Valor Semanal:</strong> R$ {{ number_format((float) $objContrato->valor_semanal, 2, ',', '.') }} ({{ valorPorExtenso($objContrato->valor_semanal) }})<br>
        <strong>Dia de Pagamento:</strong> {{ diaDaSemana($objContrato->dia_pagamento) }}<br>
        <strong>Caução:</strong> R$ {{ number_format((float) ($objContrato->caucao ?? 0), 2, ',', '.') }}
    </p>

    <div class="page-break"></div>

    <h2>CLÁUSULAS:</h2>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 1ª – DO OBJETO</div>
        <p>O presente contrato tem por objeto a locação do veículo descrito acima, em perfeitas condições de uso, conservação e funcionamento.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 2ª – DO PRAZO</div>
        <p>O prazo de locação é por tempo indeterminado, iniciando-se em {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('d/m/Y') : '___/___/______' }}, podendo ser rescindido por qualquer das partes mediante aviso prévio de 7 (sete) dias.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 3ª – DO VALOR E FORMA DE PAGAMENTO</div>
        <p>O LOCATÁRIO pagará ao LOCADOR o valor semanal de R$ {{ number_format((float) $objContrato->valor_semanal, 2, ',', '.') }}, a ser pago toda {{ diaDaSemana($objContrato->dia_pagamento) }}, mediante:</p>
        <p>
            @if(!empty($arrLocador['locador_pix']))
                <strong>PIX:</strong> {{ $arrLocador['locador_pix'] }}<br>
            @endif
            @if(!empty($arrLocador['locador_banco']))
                <strong>Dados Bancários:</strong> {{ $arrLocador['locador_banco'] }}
            @endif
        </p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 4ª – DA CAUÇÃO</div>
        <p>O LOCATÁRIO entregou ao LOCADOR a quantia de R$ {{ number_format((float) ($objContrato->caucao ?? 0), 2, ',', '.') }} a título de caução, que será devolvida ao final do contrato, desde que o veículo seja devolvido nas mesmas condições em que foi entregue.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 5ª – DAS OBRIGAÇÕES DO LOCATÁRIO</div>
        <p>São obrigações do LOCATÁRIO:</p>
        <ul>
            <li>Manter o veículo em perfeitas condições de uso, conservação e limpeza;</li>
            <li>Arcar com todas as despesas de combustível, lavagem e pequenos reparos;</li>
            <li>Comunicar imediatamente ao LOCADOR qualquer problema mecânico ou acidente;</li>
            <li>Não utilizar o veículo para fins ilícitos ou transporte de cargas perigosas;</li>
            <li>Não sublocar ou emprestar o veículo a terceiros sem autorização prévia;</li>
            <li>Respeitar todas as leis de trânsito e regulamentações vigentes;</li>
            <li>Arcar com multas de trânsito cometidas durante o período de locação;</li>
            <li>Devolver o veículo na data acordada, nas mesmas condições em que foi recebido.</li>
        </ul>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 6ª – DAS OBRIGAÇÕES DO LOCADOR</div>
        <p>São obrigações do LOCADOR:</p>
        <ul>
            <li>Entregar o veículo em perfeitas condições de uso e funcionamento;</li>
            <li>Manter o seguro obrigatório (DPVAT) e o licenciamento em dia;</li>
            <li>Arcar com despesas de manutenção preventiva e corretiva de grande porte;</li>
            <li>Fornecer assistência em caso de pane mecânica não causada por mau uso.</li>
        </ul>
    </div>

    <div class="page-break"></div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 7ª – DA FRANQUIA DE QUILOMETRAGEM</div>
        <p>O veículo possui franquia semanal de 1.000 km (mil quilômetros). Caso ultrapassado este limite, será cobrado R$ 0,50 (cinquenta centavos) por quilômetro excedente.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 8ª – DAS MULTAS E PENALIDADES</div>
        <p>Em caso de atraso no pagamento, será cobrada multa de 2% (dois por cento) sobre o valor devido, acrescida de juros de 1% (um por cento) ao mês.</p>
        <p>Em caso de danos ao veículo causados por mau uso ou negligência do LOCATÁRIO, este arcará integralmente com os custos de reparo.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 9ª – DA RESCISÃO</div>
        <p>O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 7 (sete) dias. Em caso de descumprimento das obrigações contratuais, a parte prejudicada poderá rescindir o contrato imediatamente, sem prejuízo das perdas e danos.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 10ª – DO FORO</div>
        <p>Fica eleito o foro da comarca de {{ $arrLocador['locador_cidade_uf'] ?? '___________________________' }} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.</p>
    </div>

    @if($objContrato->clausulas_adicionais)
    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULAS ADICIONAIS</div>
        <p style="white-space: pre-wrap;">{{ $objContrato->clausulas_adicionais }}</p>
    </div>
    @endif

    <p style="margin-top: 24px;">E por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.</p>

    <p style="text-align: center; margin-top: 16px;">
        {{ $arrLocador['locador_cidade_uf'] ?? '___________________________' }}, {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('d') : '__' }} de {{ $objContrato->data_inicio ? mesExtenso($objContrato->data_inicio->format('m')) : '____________' }} de {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('Y') : '____' }}.
    </p>

    <div class="assinatura">
        <div class="assinatura-linha"></div>
        <p><strong>LOCADOR</strong><br>{{ $arrLocador['locador_nome'] ?? '' }}</p>
    </div>

    <div class="assinatura">
        <div class="assinatura-linha"></div>
        <p><strong>LOCATÁRIO</strong><br>{{ $objContrato->condutor->nome ?? '' }}</p>
    </div>

    <div style="margin-top: 40px;">
        <p><strong>TESTEMUNHAS:</strong></p>
        <div class="assinatura">
            <div class="assinatura-linha"></div>
            <p>Nome: _______________________________<br>CPF: _______________________________</p>
        </div>
        <div class="assinatura">
            <div class="assinatura-linha"></div>
            <p>Nome: _______________________________<br>CPF: _______________________________</p>
        </div>
    </div>
</body>
</html>

@php
function valorPorExtenso($valor) {
    $valor = (float) $valor;
    $inteiro = (int) $valor;
    $centavos = (int) round(($valor - $inteiro) * 100);
    
    $unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    $dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    $especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    $centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
    $extenso = function($num) use ($unidades, $dezenas, $especiais, $centenas) {
        if ($num == 0) return 'zero';
        if ($num == 100) return 'cem';
        
        $resultado = '';
        $c = (int) ($num / 100);
        $d = (int) (($num % 100) / 10);
        $u = $num % 10;
        
        if ($c > 0) $resultado .= $centenas[$c];
        if ($d > 0 || $u > 0) {
            if ($c > 0) $resultado .= ' e ';
            if ($d == 1) {
                $resultado .= $especiais[$u];
            } else {
                if ($d > 0) $resultado .= $dezenas[$d];
                if ($u > 0) {
                    if ($d > 0) $resultado .= ' e ';
                    $resultado .= $unidades[$u];
                }
            }
        }
        return $resultado;
    };
    
    $resultado = $extenso($inteiro) . ' ' . ($inteiro == 1 ? 'real' : 'reais');
    if ($centavos > 0) {
        $resultado .= ' e ' . $extenso($centavos) . ' ' . ($centavos == 1 ? 'centavo' : 'centavos');
    }
    
    return $resultado;
}

function diaDaSemana($dia) {
    $dias = [
        1 => 'Segunda-feira',
        2 => 'Terça-feira',
        3 => 'Quarta-feira',
        4 => 'Quinta-feira',
        5 => 'Sexta-feira',
        6 => 'Sábado',
        7 => 'Domingo'
    ];
    return $dias[$dia] ?? '___________________________';
}

function mesExtenso($mes) {
    $meses = [
        '01' => 'janeiro',
        '02' => 'fevereiro',
        '03' => 'março',
        '04' => 'abril',
        '05' => 'maio',
        '06' => 'junho',
        '07' => 'julho',
        '08' => 'agosto',
        '09' => 'setembro',
        '10' => 'outubro',
        '11' => 'novembro',
        '12' => 'dezembro'
    ];
    return $meses[$mes] ?? '';
}
@endphp

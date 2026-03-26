<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CONTRATO DE LOCAÇÃO DE AUTOMÓVEL POR PRAZO INDETERMINADO</title>
    <style>
        @page { margin: 2cm 1.7cm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; line-height: 1.35; color: #000; }
        p { margin: 0 0 8px 0; text-align: justify; }
        .titulo { text-align: center; font-size: 12.5pt; font-weight: bold; margin-bottom: 12px; }
        .subtitulo { font-weight: bold; margin: 10px 0 8px 0; }
        .clausula { margin-top: 8px; }
        .page-break { page-break-after: always; }
        .assinaturas { margin-top: 24px; }
        .assinatura { margin-top: 34px; text-align: center; }
        .linha { border-top: 1px solid #000; width: 240px; margin: 0 auto 5px auto; }
    </style>
</head>
<body>
    <p class="titulo">CONTRATO DE LOCAÇÃO DE AUTOMÓVEL POR PRAZO INDETERMINADO</p>
    <p class="subtitulo">IDENTIFICAÇÃO DAS PARTES CONTRATANTES</p>

    <p><strong>LOCADOR:</strong> {{ $arrLocador['locador_nome'] ?? '________________________' }}, inscrito no CPF nº {{ $arrLocador['locador_cpf'] ?? '________________' }}, residente em endereço {{ $arrLocador['locador_endereco'] ?? '________________________' }}.</p>

    <p><strong>LOCATÁRIO:</strong> {{ $objContrato->condutor->nome ?? '________________________' }}, CPF {{ $objContrato->condutor->cpf ?? '________________' }}, residente e domiciliado em {{ $objContrato->condutor->endereco ?? '________________________' }}.</p>

    <p>As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Locação de Automóvel por Prazo indeterminado, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.</p>

    <p class="subtitulo">DO OBJETO DO CONTRATO</p>
    <p class="clausula"><strong>Cláusula 1ª.</strong> O presente contrato tem como OBJETO a locação do automóvel marca/modelo {{ $objContrato->veiculo->modelo ?? '________________' }} ano {{ $objContrato->veiculo->ano ?? '____' }} cor {{ $objContrato->veiculo->cor ?? '____' }}, placa {{ $objContrato->veiculo->placa ?? '____' }}, RENAVAM {{ $objContrato->veiculo->renavam ?? '____' }} de propriedade do LOCADOR.</p>

    <p class="subtitulo">DO USO</p>
    <p class="clausula"><strong>Cláusula 2ª.</strong> O automóvel, objeto deste contrato, será utilizado exclusivamente pelo LOCATÁRIO para uso profissional nas plataformas UBER e 99 POP (ou outras plataformas de transporte de passageiros) e também para uso pessoal, não sendo permitido, em nenhuma hipótese, o seu uso por terceiros, empréstimos ou para fins diversos. SOMENTE O LOCATARIO DESTE CONTRATO PODERA DIRIGIR O VEICULO.</p>

    <p><strong>Parágrafo 1ª.</strong> Fica estabelecido o limite máximo de 5.000 km (cinco mil quilômetros) rodados por mês durante a vigência do presente contrato. Ultrapassado o referido limite mensal, o LOCATÁRIO ficará obrigado ao pagamento de multa no valor de R$ 200,00 (duzentos reais), acrescida do valor de R$ 1,00 (um real) por quilômetro excedente, a ser pago ao final de cada período mensal.</p>
    <p><strong>Parágrafo 2ª.</strong> A manutenção do veículo, em qualquer situação, será de responsabilidade do LOCADOR, cabendo a este procurar oficinas e realizar orçamentos sempre que necessário. Contudo, caso seja constatado que o reparo se deu em razão de mau uso, negligência ou má-fé por parte do LOCATÁRIO, os custos correspondentes serão de sua inteira responsabilidade.</p>
    <p><strong>Parágrafo 3ª.</strong> Fica de inteira responsabilidade do LOCATÁRIO a manutenção do veículo na bomba de gasolina; vindo a dar qualquer defeito, o LOCADOR tomará as providências e o LOCATÁRIO irá arcar com os custos necessários.</p>
    <p><strong>Parágrafo 4ª.</strong> Possíveis danos a serem causados no veículo em catástrofes naturais (chuva, alagamento, inundação), o LOCADOR não ficará responsável pelo reparo, dando ao LOCATÁRIO o dever de arcar com todas as despesas do veículo.</p>
    <p><strong>Parágrafo 5ª.</strong> Em caso de sinistro (roubo, colisão, acidente em geral) que danifique o veículo, o LOCATÁRIO será responsável pelo pagamento da franquia, no valor de R$ {{ number_format((float) ($objContrato->caucao ?? 5000), 2, ',', '.') }} ({{ valorPorExtenso((float) ($objContrato->caucao ?? 5000)) }}), a ser pago de imediato.</p>
    <p><strong>Parágrafo 6ª.</strong> O não cumprimento ou violação da cláusula 2ª (uso), o LOCADOR terá o direito de recolhimento do veículo imediatamente.</p>

    <p class="clausula"><strong>Cláusula 3ª.</strong> Em caso de viagens o LOCATÁRIO deverá informar ao LOCADOR e só será permitida a saída do veículo da cidade se o LOCADOR permitir, caso liberado o LOCATÁRIO será responsável por eventuais incidentes sobre o veículo em geral.</p>

    <div class="page-break"></div>

    <p class="subtitulo">DA DEVOLUÇÃO</p>
    <p class="clausula"><strong>Cláusula 4ª.</strong> O LOCATÁRIO deverá devolver o automóvel ao LOCADOR nas mesmas condições em que estava quando o recebeu, ou seja, em perfeitas condições de uso, conforme laudo de vistoria pessoal entre partes e fotos em anexo deste contrato, respondendo pelos danos ou prejuízo causados.</p>
    <p><strong>Parágrafo 1ª.</strong> O veículo deverá ser devolvido até as 18h do dia de encerramento deste contrato, devidamente limpo. Caso contrário, o LOCATÁRIO pagará ao LOCADOR o valor de R$ 50,00 (cinquenta reais) referente à taxa de limpeza.</p>

    <p class="subtitulo">DO PRAZO</p>
    <p class="clausula"><strong>Cláusula 5ª.</strong> A presente locação terá lapso temporal indeterminado, iniciando no dia {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('d/m/Y') : '__/__/____' }}.</p>

    <p class="subtitulo">DA RESCISÃO</p>
    <p class="clausula"><strong>Cláusula 6ª.</strong> É assegurada às partes a rescisão do presente contrato a qualquer momento, desde que haja comunicação à outra parte com antecedência mínima de 7 (sete) dias.</p>

    <p class="subtitulo">DO PAGAMENTO</p>
    <p class="clausula"><strong>Cláusula 7ª.</strong> O valor da locação é de R$ {{ number_format((float) $objContrato->valor_semanal, 2, ',', '.') }} ({{ mb_strtoupper(valorPorExtenso((float) $objContrato->valor_semanal)) }}) por semana de uso e deverá ser adimplido todas as {{ mb_strtoupper(diaDaSemana($objContrato->dia_pagamento)) }} de cada semana por meio de transferência bancária para a conta (PIX) – {{ $arrLocador['locador_pix'] ?? '________________' }}, banco {{ $arrLocador['locador_banco'] ?? '________________' }}, {{ $arrLocador['locador_nome'] ?? '________________' }}, onde o LOCATARIO deverá enviar o comprovante para o contato responsável, juntamente com a foto do KM atual do veículo.</p>
    <p><strong>Obs:</strong> O não envio do KM será cobrado uma taxa de R$ 50,00 na semana subsequente.</p>
    <p><strong>Parágrafo 1ª.</strong> O LOCATÁRIO se prontifica a fazer o pagamento no máximo até as 18h00min do dia do vencimento.</p>
    <p><strong>Parágrafo 2ª.</strong> Será cobrada do LOCATÁRIO uma taxa de juros de R$ 50,00 por dia de atraso do pagamento.</p>

    <p class="clausula"><strong>Cláusula 8ª.</strong> Fica o LOCATÁRIO responsável pelas multas de trânsito que eventualmente cometer, incluindo a transferência de pontuação e pagamento dos valores, devendo para tal disponibilizar a documentação requerida e no prazo indicado pelo Departamento de Trânsito, DETRAN.</p>
    <p class="clausula"><strong>Cláusula 9ª.</strong> Os impostos e encargos incidentes sobre o veículo, IPVA, seguro DPVAT, licenciamento anual e manutenção serão suportados exclusivamente pelo LOCADOR.</p>

    <div class="page-break"></div>

    <p class="clausula"><strong>Cláusula 10ª.</strong> Os valores a título de seguro contra furto, roubo e acidentes contratado para o veículo serão suportados pelo LOCADOR.</p>
    <p><strong>Parágrafo único.</strong> Em caso de acidente ocasionado por culpa ou dolo do LOCATÁRIO, este ficará responsável pelo pagamento da franquia de seguro.</p>

    @if($objContrato->clausulas_adicionais)
        <p class="clausula"><strong>CLÁUSULAS ADICIONAIS.</strong> {{ $objContrato->clausulas_adicionais }}</p>
    @endif

    <p class="subtitulo">DO FORO</p>
    <p><strong>Cláusula Nª.</strong> Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem o foro da comarca de {{ $arrLocador['locador_cidade_uf'] ?? '________________' }}.</p>
    <p>Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor, juntamente com 2 (duas) testemunhas.</p>

    <p style="text-align: center; margin-top: 14px;">
        {{ $arrLocador['locador_cidade_uf'] ?? '________________' }}, {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('d') : '__' }} de {{ $objContrato->data_inicio ? mb_strtoupper(mesExtenso($objContrato->data_inicio->format('m'))) : '____________' }} de {{ $objContrato->data_inicio ? $objContrato->data_inicio->format('Y') : '____' }}.
    </p>

    <div class="assinaturas">
        <div class="assinatura">
            <div class="linha"></div>
            <p>LOCADOR</p>
        </div>
        <div class="assinatura">
            <div class="linha"></div>
            <p>LOCATÁRIO</p>
        </div>
        <div class="assinatura">
            <div class="linha"></div>
            <p>Testemunha</p>
        </div>
        <div class="assinatura">
            <div class="linha"></div>
            <p>Testemunha</p>
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

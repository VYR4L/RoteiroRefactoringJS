const { readFileSync } = require('fs');

function calcularCreditos(apre, peca) {
    let creditos = Math.max(apre.audiencia - 30, 0);
    if (peca.tipo === "comedia") {
        creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(valor / 100);
}

function gerarFaturaStr(fatura, pecas) {

    // função query
    function getPeca(apresentacao) {
        return pecas[apresentacao.id];
    }

    // função extraída
    function calcularTotalApresentacao(apre, peca) {
        let total = 0;
        switch (peca.tipo) {
            case "tragedia":
                total = 40000;
                if (apre.audiencia > 30) {
                    total += 1000 * (apre.audiencia - 30);
                }
                break;
            case "comedia":
                total = 30000;
                if (apre.audiencia > 20) {
                    total += 10000 + 500 * (apre.audiencia - 20);
                }
                total += 300 * apre.audiencia;
                break;
            default:
                throw new Error(`Peça desconhecida: ${peca.tipo}`);
        }
        return total;
    }

    let totalFatura = 0;
    let creditos = 0;
    let faturaStr = `Fatura ${fatura.cliente}\n`;

    for (let apre of fatura.apresentacoes) {
        // Substituímos o uso de `peca` por chamadas a `getPeca(apre)`
        let total = calcularTotalApresentacao(apre, getPeca(apre));

        // créditos para próximas contratações
        creditos += calcularCreditos(apre, getPeca(apre));

        // mais uma linha da fatura
        faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
        totalFatura += total;
    }

    faturaStr += `Valor total: ${formatarMoeda(totalFatura)}\n`;
    faturaStr += `Créditos acumulados: ${creditos} \n`;
    return faturaStr;
}

// Carregar dados
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Gerar e exibir fatura
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);

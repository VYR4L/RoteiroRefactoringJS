const { readFileSync } = require('fs');

class Repositorio {
    constructor() {
        this.pecas = JSON.parse(readFileSync('./pecas.json'));
    }

    getPeca(apre) {
        return this.pecas[apre.id];
    }
}

class ServicoCalculoFatura {
    constructor(repo) {
        this.repo = repo;
    }

    calcularCredito(apre) {
        let creditos = 0;
        creditos += Math.max(apre.audiencia - 30, 0);
        if (this.repo.getPeca(apre).tipo === "comedia") {
            creditos += Math.floor(apre.audiencia / 5);
        }
        return creditos;
    }

    calcularTotalCreditos(apresentacoes) {
        return apresentacoes.reduce((total, apre) => total + this.calcularCredito(apre), 0);
    }

    calcularTotalApresentacao(apre) {
        const peca = this.repo.getPeca(apre);
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

    calcularTotalFatura(apresentacoes) {
        return apresentacoes.reduce((total, apre) => total + this.calcularTotalApresentacao(apre), 0);
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(valor / 100);
}

function gerarFaturaStr(fatura, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
    return faturaStr;
}

// Carregar dados
const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());

// Gerar e exibir fatura
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);

// Comentar a função gerarFaturaHTML e sua chamada
/*
function gerarFaturaHTML(fatura, pecas) {
    // Corpo comentado
}

const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaHTML);
*/

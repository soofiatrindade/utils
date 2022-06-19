function taxaJuros (paymentsPerYear, paymentAmount, presentValue, futureValue = null, dueEndOrBeginning = null, interest = null) {
  // If interest, futureValue, dueEndorBeginning was not set, set now
  if (interest === null) interest = 0.01
  if (futureValue === null) futureValue = 0
  if (dueEndOrBeginning === null) dueEndOrBeginning = 0

  let FINANCIAL_MAX_ITERATIONS = 128 // Bet accuracy with 128
  let FINANCIAL_PRECISION = 0.0000001 // 1.0e-8

  let y, y0, y1, x0
  let x1 = 0
  let f = 0
  let i = 0
  let rate = interest
  if (Math.abs(rate) < FINANCIAL_PRECISION) {
    y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue
  } else {
    f = Math.exp(paymentsPerYear * Math.log(1 + rate))
    y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue
  }
  y0 = presentValue + paymentAmount * paymentsPerYear + futureValue
  y1 = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue
  i = x0 = 0.0
  x1 = rate
  while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
    rate = (y1 * x0 - y0 * x1) / (y1 - y0)
    x0 = x1
    x1 = rate
    if (rate < FINANCIAL_PRECISION) {
      y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue
    } else {
      f = Math.exp(paymentsPerYear * Math.log(1 + rate))
      y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue
    }

    y0 = y1
    y1 = y
    ++i
  }
  return rate
}

function tabelaAmortizacao (valor, prazo, parcela, taxa) {
  let contador = 0
  let total = 0

  let parcelas = []
  for (contador = 0; contador < prazo; contador++) {
    let item = contador + 1
    let juros = valor * taxa
    let amortizacao = parcela - juros
    let saldo = valor - amortizacao
    saldo += calculaIOF(saldo, item)
    parcelas.push({
      item,
      parcela,
      saldo
    })
    total += parcela
    valor -= amortizacao
  }
  return { parcelas, total }
}

export function calculaIOF (valor, prazo = 1) {
  return 0.00043 * valor * prazo
}

export function iofTaxa (taxa) {
  return 0.0812 * taxa
}

function calculaPrazo (taxa, parcela, valor) {
  let taxa100 = taxa / 100
  let prazo = Math.log(1 - (valor * taxa100 / parcela)) / Math.log(1 / (1 + taxa100))
  return Math.round(prazo * 100) / 100
}

function calculaTaxa (prazo, parcela, valor) {
  return taxaJuros(prazo, parcela, -valor) * 100
}

function calculaParcela (prazo, taxa, valor) {
  let taxa100 = taxa / 100
  let parcela = (valor * taxa100) / (1 - Math.pow(1 / (1 + taxa100), prazo))
  return Math.round(parcela * 100) / 100
}

function calculaValor (prazo, taxa, parcela) {
  let taxa100 = taxa / 100
  let valor = (parcela * (1 - Math.pow(1 / (1 + taxa100), prazo)) / taxa100)
  return Math.round(valor * 100) / 100
}

export function tabelaContratoINSS (valor = 0, prazo = 0, parcela = 0) {
  const iof = calculaIOF(valor, prazo)
  const taxa = taxaJuros(prazo, parcela, -(valor + iof))
  const tabela = tabelaAmortizacao(valor + iof, prazo, parcela, taxa)

  tabela.valor = valor
  tabela.prazo = prazo
  tabela.vlr_parcela = parcela
  tabela.coeficiente = parcela / valor
  tabela.taxa = taxa
  tabela.iof = iof
  tabela.total = prazo * parcela
  tabela.saldoInicial = function () {
    let saldo = valor + (valor * taxa)
    saldo += calculaIOF(saldo, 1)
    return saldo
  }
  tabela.saldoParcela = function (parcela) {
    const i = tabela.parcelas.findIndex(el => el.item === parcela)
    if (i === -1) return tabela.saldoInicial()
    return tabela.parcelas[i].saldo > 0 ? tabela.parcelas[i].saldo : 0.00
  }
  return tabela
}

function notEmpty (field) {
  if (typeof field === 'undefined' || field === null || field === '') return false
  return true
}

export function calculadoraINSS (item, iof = true) {
  let result = {
    prazo: item.prazo || null,
    taxa: item.taxa || null,
    taxaIOF: item.taxa ? item.taxa : null,
    coeficiente: item.coeficiente || null,
    parcela: item.parcela || null,
    liberado: item.liberado || null
  }
  // Adiciona TAXA IOF
  if (result.taxaIOF && iof) result.taxaIOF = result.taxaIOF + iofTaxa(item.taxa)
  // Taxa
  if (!notEmpty(result.taxa) && notEmpty(result.prazo) && notEmpty(result.parcela) && notEmpty(result.liberado)) {
    result.taxaIOF = result.taxa = calculaTaxa(result.prazo, result.parcela, result.liberado)
  }
  // Calcula Prazo
  if (!notEmpty(result.prazo) && notEmpty(result.taxaIOF) && notEmpty(result.parcela) && notEmpty(result.liberado)) {
    result.prazo = Math.ceil(calculaPrazo(result.taxaIOF, result.parcela, result.liberado))
  }
  // Calcula Parcela
  if (!notEmpty(result.parcela) && notEmpty(result.prazo) && notEmpty(result.taxaIOF) && notEmpty(result.liberado)) {
    result.parcela = calculaParcela(result.prazo, result.taxaIOF, result.liberado)
  }
  // Calcula Valor
  if (!notEmpty(result.liberado) && notEmpty(result.prazo) && notEmpty(result.taxaIOF) && notEmpty(result.parcela)) {
    result.liberado = calculaValor(result.prazo, result.taxaIOF, result.parcela)
  }
  // Coeficiente
  if (!notEmpty(result.coeficiente) && notEmpty(result.liberado) && notEmpty(result.parcela)) {
    result.coeficiente = result.parcela / result.liberado
  }
  return result
}

export function calculadoraPorCoeficienteINSS (item) {
  let result = {
    prazo: item.prazo || null,
    taxa: item.taxa || null,
    coeficiente: item.coeficiente || null,
    parcela: item.parcela || null,
    liberado: item.liberado || null
  }
  // Coeficiente
  if (!notEmpty(result.coeficiente) && notEmpty(result.liberado) && notEmpty(result.parcela)) {
    result.coeficiente = result.parcela / result.liberado
  }
  // Calcula Parcela
  if (!notEmpty(result.parcela) && notEmpty(result.coeficiente) && notEmpty(result.liberado)) {
    result.parcela = result.coeficiente * result.liberado
  }
  // Calcula Valor
  if (!notEmpty(result.liberado) && notEmpty(result.coeficiente) && notEmpty(result.parcela)) {
    result.liberado = result.parcela / result.coeficiente
  }
  // Taxa
  if (!notEmpty(result.taxa) && notEmpty(result.prazo) && notEmpty(result.parcela) && notEmpty(result.liberado)) {
    result.taxa = calculaTaxa(result.prazo, result.parcela, result.liberado)
  }
  // Calcula Prazo
  if (!notEmpty(result.prazo) && notEmpty(result.taxa) && notEmpty(result.parcela) && notEmpty(result.liberado)) {
    result.prazo = Math.ceil(calculaPrazo(result.taxa, result.parcela, result.liberado))
  }
  return result
}

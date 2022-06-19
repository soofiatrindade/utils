import * as validate from './validate'
import * as string from './string'

export function clean (value = null) {
  if (!value) return null
  return validate.notMask(`${value}`)
}

export function cpf (value = null) {
  if (!value) return null
  return string.cpfCompleto(clean(`${value}`))
}

export function beneficio (value = null) {
  if (!value) return null
  return string.inssCompleto(clean(`${value}`))
}

export function nome (value = null) {
  if (!value) return null
  return value.split(' ').map(i => string.capitalize(i)).join(' ')
}

export function cleanNome (value = null) {
  value = nome(value)
  return string.removerAcentos(`${value}`)
}

export function telefone (value = null) {
  if (!value) return null
  return clean(`${value}`).split(' ').join('')
}

export function date (value = null) {
  if (!value) return null
  value = value.split(' ').join('')
  if (value.length === 6) {
    let ano = `${value[0]}${value[1]}${value[2]}${value[3]}`
    let mes = `${value[4]}${value[5]}`
    return new Date(ano, mes - 1, '01', 0, 0, 0, 0)
  } else if (value.length === 8) {
    let ano = `${value[0]}${value[1]}${value[2]}${value[3]}`
    let mes = `${value[4]}${value[5]}`
    let dia = `${value[6]}${value[7]}`
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0)
  } else if (value.length === 7) {
    let array = value.split('/')
    return new Date(array[1], array[0], '01', 0, 0, 0, 0)
  } else if (value.length === 10) {
    let array = value.split('/')
    return new Date(array[1], array[0] - 1, array[2], 0, 0, 0, 0)
  }
  return null
}

export function valor (value = null) {
  if (!value) return 0
  value = `${value}`.split(' ').join('').split('R$').join('')
  if (value.split(',').length > 1) {
    return parseFloat(value.split('.').join('').split(',').join('.'))
  } else {
    return parseFloat(value)
  }
}

export function integer (value = null) {
  if (!value) return 0
  value = `${value}`.split(' ').join('').split('R$').join('')
  if (value.split(',').length > 1) {
    return parseInt(value.split('.').join('').split(',').join('.'))
  } else {
    return parseInt(value)
  }
}

export function meioPagamento (value = null) {
  if (!value) return null
  value = `${value}`.split(' ').join('')
  switch (value) {
    case '1':
      return 'cartao_magnetico'
    case '2':
      return 'conta_corrente'
    default:
      return 'conta_corrente'
  }
}

export function situacaoEmprestimoCod (value = null) {
  if (!value) return '2'
  value = `${value}`.split(' ').join('')
  switch (value) {
    case 'Ativo':
      return '1'
    case 'Encerrado':
      return '2'
    case 'Excluido/Cancelado':
      return '3'
    case 'Excluido/Liquido':
      return '4'
    case 'Inativo por cessacao do beneficio':
      return '5'
    default:
      return '2'
  }
}

export function situacaoEmprestimo (value = null) {
  if (!value) return 'Encerrado'
  value = `${value}`.split(' ').join('')
  switch (value) {
    case '1':
      return 'Ativo'
    case '2':
      return 'Encerrado'
    case '3':
      return 'Excluido/Cancelado'
    case '4':
      return 'Excluido/Liquido'
    case '5':
      return 'Inativo por cessacao do beneficio'
    default:
      return 'Encerrado'
  }
}

export function situacaoBeneficio (value = null) {
  if (!value) return false
  value = `${value}`.split(' ').join('')
  switch (value) {
    case '1':
      return 'Ativo'
    default:
      return 'Inativo'
  }
}

export function beneficioActive (value = null) {
  if (!value) return false
  value = `${value}`.split(' ').join('')
  switch (value) {
    case '1':
      return true
    default:
      return false
  }
}

export function contratoActive (value = null) {
  if (!value) return false
  value = `${value}`.split(' ').join('')
  switch (value) {
    case '1':
      return true
    default:
      return false
  }
}

export function simOuNao (value = null) {
  if (!value) return false
  value = `${value}`.split(' ').join('')
  switch (value) {
    case 'SIM':
      return true
    default:
      return false
  }
}

export function mascaraFormaPagamento (forma = '') {
  let result = forma
  switch (forma) {
    case 'conta_corrente':
      result = 'Conta Corrente'
      break
    case 'cartao_magnetico':
      result = 'Cartão Magnético'
      break
    case 'empresa_conveniada':
      result = 'Empresa Conveniada'
      break
  }
  return result
}

export function removeMascaraFormaPagamento (forma = '') {
  return string.removerAcentos(string.lower(forma.replace('-', '_').replace(' ', '_')))
}

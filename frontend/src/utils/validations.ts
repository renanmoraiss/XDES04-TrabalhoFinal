export const validarISBN = (isbn: string): boolean => {
  // Remove hífens e espaços
  const isbnLimpo = isbn.replace(/[-\s]/g, '')
  
  // Verifica se tem 10 ou 13 dígitos
  if (isbnLimpo.length !== 10 && isbnLimpo.length !== 13) {
    return false
  }
  
  // Verifica se são apenas números
  if (!/^\d+$/.test(isbnLimpo)) {
    return false
  }
  
  return true
}

export const formatarISBN = (isbn: string): string => {
  const isbnLimpo = isbn.replace(/[-\s]/g, '')
  
  if (isbnLimpo.length === 10) {
    // Formato: X-XXX-XXXXX-X
    return `${isbnLimpo[0]}-${isbnLimpo.slice(1, 4)}-${isbnLimpo.slice(4, 9)}-${isbnLimpo[9]}`
  } else if (isbnLimpo.length === 13) {
    // Formato: XXX-X-XXX-XXXXX-X
    return `${isbnLimpo.slice(0, 3)}-${isbnLimpo[3]}-${isbnLimpo.slice(4, 7)}-${isbnLimpo.slice(7, 12)}-${isbnLimpo[12]}`
  }
  
  return isbn
}

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validarTelefone = (telefone: string): boolean => {
  const telefoneLimpo = telefone.replace(/[-\s()]/g, '')
  return /^\d{10,15}$/.test(telefoneLimpo)
}

export const formatarData = (data: string): string => {
  // Converte de YYYY-MM-DD para DD/MM/YYYY
  if (data.includes('/')) return data
  const partes = data.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return data
}

export const formatarDataHora = (dataHora: string): string => {
  const data = new Date(dataHora)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`
}


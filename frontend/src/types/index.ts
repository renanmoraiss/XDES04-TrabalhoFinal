export interface Livro {
  id?: string
  titulo: string
  autores: string[]
  isbn: string
  generos: string[]
  exemplares: number
  editora?: string[]
  anoPublicacao?: string
  localizacaoFisica?: string
  ativo?: boolean
  dataExclusao?: string
  usuarioExclusao?: string
}

export interface Aluno {
  id?: string
  nome: string
  numeroMatricula: string
  emailInstitucional: string
  dataNascimento?: string
  telefone?: string
  status: 'Ativo' | 'Inativo' | 'Suspenso'
  dataCadastro?: string
  ativo?: boolean
  dataExclusao?: string
  usuarioExclusao?: string
}

export interface HistoricoAlteracao {
  id?: string
  entidade: 'Livro' | 'Aluno'
  entidadeId: string
  data: string
  hora: string
  usuario: string
  alteracoes: Record<string, { anterior: any; novo: any }>
}

export interface FiltroLivro {
  titulo?: string
  autor?: string
  isbn?: string
  generos?: string[]
}

export interface FiltroAluno {
  nome?: string
  numeroMatricula?: string
  status?: string
  pendencias?: 'Sim' | 'Não' | 'Todos'
}


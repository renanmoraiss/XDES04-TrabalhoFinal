import { Livro, Aluno, HistoricoAlteracao } from '../types'

// Simulação de armazenamento local (em produção seria uma API)
const STORAGE_KEYS = {
  LIVROS: 'livros',
  ALUNOS: 'alunos',
  HISTORICO: 'historico_alteracoes',
  AUTORES: 'autores',
  EDITORAS: 'editoras'
}

export const storageService = {
  // Livros
  getLivros: (): Livro[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LIVROS)
    return data ? JSON.parse(data) : []
  },

  saveLivro: (livro: Livro): void => {
    const livros = storageService.getLivros()
    if (livro.id) {
      const index = livros.findIndex(l => l.id === livro.id)
      if (index !== -1) {
        livros[index] = livro
      }
    } else {
      livro.id = Date.now().toString()
      livro.ativo = true
      livros.push(livro)
    }
    localStorage.setItem(STORAGE_KEYS.LIVROS, JSON.stringify(livros))
  },

  deleteLivro: (id: string): void => {
    const livros = storageService.getLivros()
    const livro = livros.find(l => l.id === id)
    if (livro) {
      livro.ativo = false
      livro.dataExclusao = new Date().toISOString()
      livro.usuarioExclusao = 'admin' // Em produção viria do contexto de autenticação
      storageService.saveLivro(livro)
    }
  },

  // Alunos
  getAlunos: (): Aluno[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALUNOS)
    return data ? JSON.parse(data) : []
  },

  saveAluno: (aluno: Aluno): void => {
    const alunos = storageService.getAlunos()
    if (aluno.id) {
      const index = alunos.findIndex(a => a.id === aluno.id)
      if (index !== -1) {
        alunos[index] = aluno
      }
    } else {
      aluno.id = Date.now().toString()
      aluno.ativo = true
      aluno.dataCadastro = new Date().toISOString()
      alunos.push(aluno)
    }
    localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify(alunos))
  },

  deleteAluno: (id: string): void => {
    const alunos = storageService.getAlunos()
    const aluno = alunos.find(a => a.id === id)
    if (aluno) {
      aluno.ativo = false
      aluno.dataExclusao = new Date().toISOString()
      aluno.usuarioExclusao = 'admin'
      storageService.saveAluno(aluno)
    }
  },

  // Histórico
  saveHistorico: (historico: HistoricoAlteracao): void => {
    const historicos = storageService.getHistoricos()
    historico.id = Date.now().toString()
    historicos.push(historico)
    localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicos))
  },

  getHistoricos: (): HistoricoAlteracao[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORICO)
    return data ? JSON.parse(data) : []
  },

  // Autores
  getAutores: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTORES)
    return data ? JSON.parse(data) : []
  },

  saveAutor: (autor: string): void => {
    const autores = storageService.getAutores()
    if (!autores.includes(autor)) {
      autores.push(autor)
      localStorage.setItem(STORAGE_KEYS.AUTORES, JSON.stringify(autores))
    }
  },

  // Editoras
  getEditoras: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EDITORAS)
    return data ? JSON.parse(data) : []
  },

  saveEditora: (editora: string): void => {
    const editoras = storageService.getEditoras()
    if (!editoras.includes(editora)) {
      editoras.push(editora)
      localStorage.setItem(STORAGE_KEYS.EDITORAS, JSON.stringify(editoras))
    }
  }
}


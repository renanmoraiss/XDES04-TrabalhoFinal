import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storageService } from '../../services/storage'
import { validarISBN, formatarISBN } from '../../utils/validations'
import { Livro } from '../../types'
import './LivroForm.css'

const GENEROS = ['Ficção', 'Fantasia', 'Romance', 'Suspense', 'Terror', 'Aventura', 'Drama', 'Comédia', 'Biografia', 'História', 'Ciência', 'Técnico']

const InserirLivro = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Partial<Livro>>({
    titulo: '',
    autores: [],
    isbn: '',
    generos: [],
    exemplares: 0,
    editora: [],
    anoPublicacao: '',
    localizacaoFisica: ''
  })
  const [erros, setErros] = useState<Record<string, string>>({})
  const [novoAutor, setNovoAutor] = useState('')
  const [novaEditora, setNovaEditora] = useState('')
  const [autoresDisponiveis, setAutoresDisponiveis] = useState<string[]>([])
  const [editorasDisponiveis, setEditorasDisponiveis] = useState<string[]>([])

  useEffect(() => {
    setAutoresDisponiveis(storageService.getAutores())
    setEditorasDisponiveis(storageService.getEditoras())
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleGeneroChange = (genero: string) => {
    setFormData(prev => {
      const generos = prev.generos || []
      if (generos.includes(genero)) {
        return { ...prev, generos: generos.filter(g => g !== genero) }
      } else {
        return { ...prev, generos: [...generos, genero] }
      }
    })
  }

  const handleAdicionarAutor = () => {
    if (novoAutor.trim() && !formData.autores?.includes(novoAutor.trim())) {
      setFormData(prev => ({
        ...prev,
        autores: [...(prev.autores || []), novoAutor.trim()]
      }))
      storageService.saveAutor(novoAutor.trim())
      setAutoresDisponiveis(storageService.getAutores())
      setNovoAutor('')
    }
  }

  const handleRemoverAutor = (autor: string) => {
    setFormData(prev => ({
      ...prev,
      autores: prev.autores?.filter(a => a !== autor) || []
    }))
  }

  const handleSelecionarAutor = (autor: string) => {
    if (!formData.autores?.includes(autor)) {
      setFormData(prev => ({
        ...prev,
        autores: [...(prev.autores || []), autor]
      }))
    }
  }

  const handleAdicionarEditora = () => {
    if (novaEditora.trim() && !formData.editora?.includes(novaEditora.trim())) {
      setFormData(prev => ({
        ...prev,
        editora: [...(prev.editora || []), novaEditora.trim()]
      }))
      storageService.saveEditora(novaEditora.trim())
      setEditorasDisponiveis(storageService.getEditoras())
      setNovaEditora('')
    }
  }

  const handleRemoverEditora = (editora: string) => {
    setFormData(prev => ({
      ...prev,
      editora: prev.editora?.filter(e => e !== editora) || []
    }))
  }

  const handleSelecionarEditora = (editora: string) => {
    if (!formData.editora?.includes(editora)) {
      setFormData(prev => ({
        ...prev,
        editora: [...(prev.editora || []), editora]
      }))
    }
  }

  const handleISBNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9-]/g, '')
    setFormData(prev => ({ ...prev, isbn: value }))
    if (erros.isbn) {
      setErros(prev => ({ ...prev, isbn: '' }))
    }
  }

  const handleBlurISBN = () => {
    if (formData.isbn) {
      const isbnFormatado = formatarISBN(formData.isbn)
      setFormData(prev => ({ ...prev, isbn: isbnFormatado }))
    }
  }

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!formData.titulo || formData.titulo.trim().length === 0) {
      novosErros.titulo = 'Título é obrigatório'
    } else if (formData.titulo.length > 255) {
      novosErros.titulo = 'Título deve ter no máximo 255 caracteres'
    }

    if (!formData.autores || formData.autores.length === 0) {
      novosErros.autores = 'Pelo menos um autor é obrigatório'
    }

    if (!formData.isbn || formData.isbn.trim().length === 0) {
      novosErros.isbn = 'ISBN é obrigatório'
    } else if (!validarISBN(formData.isbn)) {
      novosErros.isbn = 'ISBN inválido. Deve ter 10 ou 13 dígitos'
    } else {
      // Verificar duplicidade
      const livros = storageService.getLivros()
      const livroExistente = livros.find(l => 
        l.ativo && l.isbn.replace(/[-\s]/g, '') === formData.isbn?.replace(/[-\s]/g, '')
      )
      if (livroExistente) {
        novosErros.isbn = 'Já existe um livro com este ISBN'
      }
    }

    if (!formData.generos || formData.generos.length === 0) {
      novosErros.generos = 'Pelo menos um gênero é obrigatório'
    }

    if (!formData.exemplares || formData.exemplares < 0) {
      novosErros.exemplares = 'Número de exemplares deve ser maior ou igual a zero'
    }

    if (formData.localizacaoFisica && formData.localizacaoFisica.length > 100) {
      novosErros.localizacaoFisica = 'Localização física deve ter no máximo 100 caracteres'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validarFormulario()) {
      storageService.saveLivro(formData as Livro)
      navigate('/livros')
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Inserir Livro</h1>
        <button onClick={() => navigate('/livros')} className="btn btn-secondary">
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="titulo">
            Título <span className="required">*</span>
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            maxLength={255}
            className={erros.titulo ? 'error' : ''}
          />
          {erros.titulo && <span className="error-message">{erros.titulo}</span>}
        </div>

        <div className="form-group">
          <label>
            Autor(es) <span className="required">*</span>
          </label>
          <div className="multiselect-container">
            <div className="input-with-button">
              <input
                type="text"
                value={novoAutor}
                onChange={(e) => setNovoAutor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarAutor())}
                placeholder="Digite um novo autor"
              />
              <button type="button" onClick={handleAdicionarAutor} className="btn btn-small">
                Adicionar
              </button>
            </div>
            {autoresDisponiveis.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelecionarAutor(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="select-existing"
              >
                <option value="">Ou selecione um autor existente</option>
                {autoresDisponiveis
                  .filter(a => !formData.autores?.includes(a))
                  .map(autor => (
                    <option key={autor} value={autor}>{autor}</option>
                  ))}
              </select>
            )}
            {formData.autores && formData.autores.length > 0 && (
              <div className="selected-items">
                {formData.autores.map(autor => (
                  <span key={autor} className="selected-item">
                    {autor}
                    <button
                      type="button"
                      onClick={() => handleRemoverAutor(autor)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {erros.autores && <span className="error-message">{erros.autores}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="isbn">
            ISBN <span className="required">*</span>
          </label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleISBNChange}
            onBlur={handleBlurISBN}
            placeholder="10 ou 13 dígitos"
            className={erros.isbn ? 'error' : ''}
          />
          {erros.isbn && <span className="error-message">{erros.isbn}</span>}
        </div>

        <div className="form-group">
          <label>
            Gênero(s) <span className="required">*</span>
          </label>
          <div className="checkbox-group">
            {GENEROS.map(genero => (
              <label key={genero} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.generos?.includes(genero) || false}
                  onChange={() => handleGeneroChange(genero)}
                />
                {genero}
              </label>
            ))}
          </div>
          {erros.generos && <span className="error-message">{erros.generos}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="exemplares">
            Exemplares <span className="required">*</span>
          </label>
          <input
            type="number"
            id="exemplares"
            name="exemplares"
            value={formData.exemplares || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, exemplares: parseInt(e.target.value) || 0 }))}
            min="0"
            className={erros.exemplares ? 'error' : ''}
          />
          {erros.exemplares && <span className="error-message">{erros.exemplares}</span>}
        </div>

        <div className="form-group">
          <label>Editora(s)</label>
          <div className="multiselect-container">
            <div className="input-with-button">
              <input
                type="text"
                value={novaEditora}
                onChange={(e) => setNovaEditora(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarEditora())}
                placeholder="Digite uma nova editora"
              />
              <button type="button" onClick={handleAdicionarEditora} className="btn btn-small">
                Adicionar
              </button>
            </div>
            {editorasDisponiveis.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelecionarEditora(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="select-existing"
              >
                <option value="">Ou selecione uma editora existente</option>
                {editorasDisponiveis
                  .filter(e => !formData.editora?.includes(e))
                  .map(editora => (
                    <option key={editora} value={editora}>{editora}</option>
                  ))}
              </select>
            )}
            {formData.editora && formData.editora.length > 0 && (
              <div className="selected-items">
                {formData.editora.map(editora => (
                  <span key={editora} className="selected-item">
                    {editora}
                    <button
                      type="button"
                      onClick={() => handleRemoverEditora(editora)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="anoPublicacao">Ano de Publicação</label>
          <input
            type="number"
            id="anoPublicacao"
            name="anoPublicacao"
            value={formData.anoPublicacao}
            onChange={handleChange}
            min="1000"
            max={new Date().getFullYear()}
            placeholder="AAAA"
          />
        </div>

        <div className="form-group">
          <label htmlFor="localizacaoFisica">Localização Física</label>
          <input
            type="text"
            id="localizacaoFisica"
            name="localizacaoFisica"
            value={formData.localizacaoFisica}
            onChange={handleChange}
            maxLength={100}
            placeholder="Ex: Corredor X - Estante Y"
            className={erros.localizacaoFisica ? 'error' : ''}
          />
          {erros.localizacaoFisica && <span className="error-message">{erros.localizacaoFisica}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/livros')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default InserirLivro


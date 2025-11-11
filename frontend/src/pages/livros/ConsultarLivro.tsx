import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { storageService } from '../../services/storage'
import { Livro, FiltroLivro } from '../../types'
import './ConsultarLivro.css'

const GENEROS = ['Ficção', 'Fantasia', 'Romance', 'Suspense', 'Terror', 'Aventura', 'Drama', 'Comédia', 'Biografia', 'História', 'Ciência', 'Técnico']

const ConsultarLivro = () => {
  const [livros, setLivros] = useState<Livro[]>([])
  const [filtros, setFiltros] = useState<FiltroLivro>({})
  const [livrosFiltrados, setLivrosFiltrados] = useState<Livro[]>([])

  useEffect(() => {
    const todosLivros = storageService.getLivros().filter(l => l.ativo !== false)
    setLivros(todosLivros)
    setLivrosFiltrados(todosLivros)
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [filtros, livros])

  const aplicarFiltros = () => {
    let resultado = [...livros]

    if (filtros.titulo) {
      const tituloLower = filtros.titulo.toLowerCase()
      resultado = resultado.filter(l => 
        l.titulo.toLowerCase().includes(tituloLower)
      )
    }

    if (filtros.autor) {
      const autorLower = filtros.autor.toLowerCase()
      resultado = resultado.filter(l => 
        l.autores.some(a => a.toLowerCase().includes(autorLower))
      )
    }

    if (filtros.isbn) {
      const isbnLimpo = filtros.isbn.replace(/[-\s]/g, '')
      resultado = resultado.filter(l => 
        l.isbn.replace(/[-\s]/g, '') === isbnLimpo
      )
    }

    if (filtros.generos && filtros.generos.length > 0) {
      resultado = resultado.filter(l => 
        filtros.generos!.some(g => l.generos.includes(g))
      )
    }

    // Ordenar alfabeticamente por título
    resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))

    setLivrosFiltrados(resultado)
  }

  const handleFiltroChange = (name: string, value: any) => {
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const handleGeneroChange = (genero: string) => {
    setFiltros(prev => {
      const generos = prev.generos || []
      if (generos.includes(genero)) {
        return { ...prev, generos: generos.filter(g => g !== genero) }
      } else {
        return { ...prev, generos: [...generos, genero] }
      }
    })
  }

  const limparFiltros = () => {
    setFiltros({})
  }

  const handleExcluir = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      storageService.deleteLivro(id)
      const todosLivros = storageService.getLivros().filter(l => l.ativo !== false)
      setLivros(todosLivros)
    }
  }

  return (
    <div className="consultar-container">
      <div className="consultar-header">
        <h1>Consultar Livros</h1>
        <Link to="/livros/inserir" className="btn btn-primary">
          + Inserir Livro
        </Link>
      </div>

      <div className="filtros-section">
        <h2>Filtros de Busca</h2>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="filtro-titulo">Título</label>
            <input
              type="text"
              id="filtro-titulo"
              value={filtros.titulo || ''}
              onChange={(e) => handleFiltroChange('titulo', e.target.value)}
              placeholder="Buscar por título..."
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-autor">Autor</label>
            <input
              type="text"
              id="filtro-autor"
              value={filtros.autor || ''}
              onChange={(e) => handleFiltroChange('autor', e.target.value)}
              placeholder="Buscar por autor..."
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-isbn">ISBN</label>
            <input
              type="text"
              id="filtro-isbn"
              value={filtros.isbn || ''}
              onChange={(e) => handleFiltroChange('isbn', e.target.value)}
              placeholder="Buscar por ISBN..."
            />
          </div>

          <div className="filtro-group">
            <label>Gênero(s)</label>
            <div className="checkbox-group-small">
              {GENEROS.map(genero => (
                <label key={genero} className="checkbox-label-small">
                  <input
                    type="checkbox"
                    checked={filtros.generos?.includes(genero) || false}
                    onChange={() => handleGeneroChange(genero)}
                  />
                  {genero}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button onClick={limparFiltros} className="btn btn-secondary">
          Limpar Filtros
        </button>
      </div>

      <div className="resultados-section">
        <h2>
          Resultados ({livrosFiltrados.length} {livrosFiltrados.length === 1 ? 'livro' : 'livros'})
        </h2>

        {livrosFiltrados.length === 0 ? (
          <div className="sem-resultados">
            <p>Nenhum livro encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="livros-grid">
            {livrosFiltrados.map(livro => (
              <div key={livro.id} className="livro-card">
                <div className="livro-header">
                  <h3>{livro.titulo}</h3>
                </div>
                <div className="livro-body">
                  <p><strong>Autor(es):</strong> {livro.autores.join(', ')}</p>
                  <p><strong>ISBN:</strong> {livro.isbn}</p>
                  <p><strong>Gênero(s):</strong> {livro.generos.join(', ')}</p>
                  <p><strong>Exemplares:</strong> {livro.exemplares}</p>
                  {livro.editora && livro.editora.length > 0 && (
                    <p><strong>Editora(s):</strong> {livro.editora.join(', ')}</p>
                  )}
                  {livro.anoPublicacao && (
                    <p><strong>Ano:</strong> {livro.anoPublicacao}</p>
                  )}
                  {livro.localizacaoFisica && (
                    <p><strong>Localização:</strong> {livro.localizacaoFisica}</p>
                  )}
                </div>
                <div className="livro-actions">
                  <Link to={`/livros/alterar/${livro.id}`} className="btn btn-small btn-secondary">
                    Alterar
                  </Link>
                  <button
                    onClick={() => handleExcluir(livro.id!)}
                    className="btn btn-small btn-danger"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultarLivro


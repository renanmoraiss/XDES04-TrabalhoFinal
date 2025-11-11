import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { storageService } from '../../services/storage'
import { Aluno, FiltroAluno } from '../../types'
import { formatarData, formatarDataHora } from '../../utils/validations'
import './ConsultarAluno.css'

const ConsultarAluno = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [filtros, setFiltros] = useState<FiltroAluno>({})
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([])

  useEffect(() => {
    const todosAlunos = storageService.getAlunos().filter(a => a.ativo !== false)
    setAlunos(todosAlunos)
    setAlunosFiltrados(todosAlunos)
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [filtros, alunos])

  const aplicarFiltros = () => {
    let resultado = [...alunos]

    if (filtros.nome) {
      const nomeLower = filtros.nome.toLowerCase()
      resultado = resultado.filter(a => 
        a.nome.toLowerCase().includes(nomeLower)
      )
    }

    if (filtros.numeroMatricula) {
      resultado = resultado.filter(a => 
        a.numeroMatricula === filtros.numeroMatricula
      )
    }

    if (filtros.status) {
      resultado = resultado.filter(a => a.status === filtros.status)
    }

    if (filtros.pendencias && filtros.pendencias !== 'Todos') {
      // Simulação de verificação de pendências
      // Em produção, isso consultaria a tabela de empréstimos
      const temPendencias = filtros.pendencias === 'Sim'
      // Por enquanto, vamos simular que alguns alunos têm pendências
      resultado = resultado.filter(a => {
        // Simulação: alunos com status Suspenso têm pendências
        const temPendencia = a.status === 'Suspenso'
        return temPendencias ? temPendencia : !temPendencia
      })
    }

    // Ordenar alfabeticamente por nome
    resultado.sort((a, b) => a.nome.localeCompare(b.nome))

    setAlunosFiltrados(resultado)
  }

  const handleFiltroChange = (name: string, value: any) => {
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const limparFiltros = () => {
    setFiltros({})
  }

  const handleExcluir = (id: string) => {
    const aluno = alunos.find(a => a.id === id)
    if (aluno) {
      // Verificar se tem pendências (em produção seria verificação real)
      if (aluno.status === 'Suspenso') {
        alert('Não é possível excluir aluno com pendências. Resolva as pendências primeiro.')
        return
      }
      
      if (window.confirm(`Tem certeza que deseja excluir o aluno ${aluno.nome}?`)) {
        storageService.deleteAluno(id)
        const todosAlunos = storageService.getAlunos().filter(a => a.ativo !== false)
        setAlunos(todosAlunos)
      }
    }
  }

  return (
    <div className="consultar-container">
      <div className="consultar-header">
        <h1>Consultar Alunos</h1>
        <Link to="/alunos/inserir" className="btn btn-primary">
          + Inserir Aluno
        </Link>
      </div>

      <div className="filtros-section">
        <h2>Filtros de Busca</h2>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="filtro-nome">Nome</label>
            <input
              type="text"
              id="filtro-nome"
              value={filtros.nome || ''}
              onChange={(e) => handleFiltroChange('nome', e.target.value)}
              placeholder="Buscar por nome..."
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-matricula">Nº de Matrícula</label>
            <input
              type="text"
              id="filtro-matricula"
              value={filtros.numeroMatricula || ''}
              onChange={(e) => handleFiltroChange('numeroMatricula', e.target.value)}
              placeholder="Buscar por matrícula..."
              maxLength={4}
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-status">Status</label>
            <select
              id="filtro-status"
              value={filtros.status || ''}
              onChange={(e) => handleFiltroChange('status', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-pendencias">Pendências</label>
            <select
              id="filtro-pendencias"
              value={filtros.pendencias || 'Todos'}
              onChange={(e) => handleFiltroChange('pendencias', e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              <option value="Sim">Com Pendências</option>
              <option value="Não">Sem Pendências</option>
            </select>
          </div>
        </div>

        <button onClick={limparFiltros} className="btn btn-secondary">
          Limpar Filtros
        </button>
      </div>

      <div className="resultados-section">
        <h2>
          Resultados ({alunosFiltrados.length} {alunosFiltrados.length === 1 ? 'aluno' : 'alunos'})
        </h2>

        {alunosFiltrados.length === 0 ? (
          <div className="sem-resultados">
            <p>Nenhum aluno encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="alunos-grid">
            {alunosFiltrados.map(aluno => (
              <div key={aluno.id} className="aluno-card">
                <div className="aluno-header">
                  <h3>{aluno.nome}</h3>
                  <span className={`status-badge status-${aluno.status.toLowerCase()}`}>
                    {aluno.status}
                  </span>
                </div>
                <div className="aluno-body">
                  <p><strong>Matrícula:</strong> {aluno.numeroMatricula}</p>
                  <p><strong>E-mail:</strong> {aluno.emailInstitucional}</p>
                  {aluno.dataNascimento && (
                    <p><strong>Data de Nascimento:</strong> {formatarData(aluno.dataNascimento)}</p>
                  )}
                  {aluno.telefone && (
                    <p><strong>Telefone:</strong> {aluno.telefone}</p>
                  )}
                  {aluno.dataCadastro && (
                    <p><strong>Data de Cadastro:</strong> {formatarDataHora(aluno.dataCadastro)}</p>
                  )}
                </div>
                <div className="aluno-actions">
                  <Link to={`/alunos/alterar/${aluno.id}`} className="btn btn-small btn-secondary">
                    Alterar
                  </Link>
                  <button
                    onClick={() => handleExcluir(aluno.id!)}
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

export default ConsultarAluno


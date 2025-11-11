import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>Bem-vindo ao Sistema de Biblioteca</h1>
        <p>Gerencie livros e alunos de forma eficiente</p>
      </div>

      <div className="home-cards">
        <div className="home-card">
          <div className="card-icon">📖</div>
          <h2>Gerenciar Livros</h2>
          <p>Cadastre, consulte, altere e exclua livros do acervo</p>
          <div className="card-actions">
            <Link to="/livros/inserir" className="btn btn-primary">
              Inserir Livro
            </Link>
            <Link to="/livros" className="btn btn-secondary">
              Consultar Livros
            </Link>
          </div>
        </div>

        <div className="home-card">
          <div className="card-icon">👥</div>
          <h2>Gerenciar Alunos</h2>
          <p>Cadastre, consulte, altere e exclua alunos do sistema</p>
          <div className="card-actions">
            <Link to="/alunos/inserir" className="btn btn-primary">
              Inserir Aluno
            </Link>
            <Link to="/alunos" className="btn btn-secondary">
              Consultar Alunos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home


import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">📚 Sistema de Biblioteca</h1>
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Início
            </Link>
            <Link 
              to="/livros" 
              className={location.pathname.startsWith('/livros') ? 'nav-link active' : 'nav-link'}
            >
              Livros
            </Link>
            <Link 
              to="/alunos" 
              className={location.pathname.startsWith('/alunos') ? 'nav-link active' : 'nav-link'}
            >
              Alunos
            </Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LivroRoutes from './routes/LivroRoutes'
import AlunoRoutes from './routes/AlunoRoutes'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/livros/*" element={<LivroRoutes />} />
          <Route path="/alunos/*" element={<AlunoRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App


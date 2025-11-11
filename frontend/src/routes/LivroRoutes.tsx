import { Routes, Route, Navigate } from 'react-router-dom'
import InserirLivro from '../pages/livros/InserirLivro'
import ConsultarLivro from '../pages/livros/ConsultarLivro'
import AlterarLivro from '../pages/livros/AlterarLivro'

const LivroRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ConsultarLivro />} />
      <Route path="/inserir" element={<InserirLivro />} />
      <Route path="/alterar/:id" element={<AlterarLivro />} />
      <Route path="*" element={<Navigate to="/livros" replace />} />
    </Routes>
  )
}

export default LivroRoutes


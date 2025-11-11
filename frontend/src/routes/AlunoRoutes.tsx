import { Routes, Route, Navigate } from 'react-router-dom'
import InserirAluno from '../pages/alunos/InserirAluno'
import ConsultarAluno from '../pages/alunos/ConsultarAluno'
import AlterarAluno from '../pages/alunos/AlterarAluno'

const AlunoRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ConsultarAluno />} />
      <Route path="/inserir" element={<InserirAluno />} />
      <Route path="/alterar/:id" element={<AlterarAluno />} />
      <Route path="*" element={<Navigate to="/alunos" replace />} />
    </Routes>
  )
}

export default AlunoRoutes


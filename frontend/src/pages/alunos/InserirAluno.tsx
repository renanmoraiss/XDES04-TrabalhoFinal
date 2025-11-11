import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storageService } from '../../services/storage'
import { validarEmail, validarTelefone, formatarData } from '../../utils/validations'
import { Aluno } from '../../types'
import './AlunoForm.css'

const InserirAluno = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Partial<Aluno>>({
    nome: '',
    numeroMatricula: '',
    emailInstitucional: '',
    dataNascimento: '',
    telefone: '',
    status: 'Ativo'
  })
  const [erros, setErros] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Formato DD/MM/AAAA
    if (value.length <= 10) {
      value = value.replace(/\D/g, '')
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2)
      }
      if (value.length > 5) {
        value = value.slice(0, 5) + '/' + value.slice(5, 9)
      }
      setFormData(prev => ({ ...prev, dataNascimento: value }))
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 15) value = value.slice(0, 15)
    setFormData(prev => ({ ...prev, telefone: value }))
  }

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!formData.nome || formData.nome.trim().length === 0) {
      novosErros.nome = 'Nome é obrigatório'
    } else if (formData.nome.length > 150) {
      novosErros.nome = 'Nome deve ter no máximo 150 caracteres'
    }

    if (!formData.numeroMatricula || formData.numeroMatricula.trim().length === 0) {
      novosErros.numeroMatricula = 'Nº de Matrícula é obrigatório'
    } else if (formData.numeroMatricula.length !== 4) {
      novosErros.numeroMatricula = 'Nº de Matrícula deve ter exatamente 4 caracteres'
    } else {
      // Verificar duplicidade
      const alunos = storageService.getAlunos()
      const alunoExistente = alunos.find(a => 
        a.ativo && a.numeroMatricula === formData.numeroMatricula
      )
      if (alunoExistente) {
        novosErros.numeroMatricula = 'Já existe um aluno com este Nº de Matrícula'
      }
    }

    if (!formData.emailInstitucional || formData.emailInstitucional.trim().length === 0) {
      novosErros.emailInstitucional = 'E-mail Institucional é obrigatório'
    } else if (formData.emailInstitucional.length > 100) {
      novosErros.emailInstitucional = 'E-mail deve ter no máximo 100 caracteres'
    } else if (!validarEmail(formData.emailInstitucional)) {
      novosErros.emailInstitucional = 'E-mail inválido'
    } else {
      // Verificar duplicidade
      const alunos = storageService.getAlunos()
      const alunoExistente = alunos.find(a => 
        a.ativo && a.emailInstitucional.toLowerCase() === formData.emailInstitucional?.toLowerCase()
      )
      if (alunoExistente) {
        novosErros.emailInstitucional = 'Já existe um aluno com este e-mail'
      }
    }

    if (formData.dataNascimento) {
      const partes = formData.dataNascimento.split('/')
      if (partes.length !== 3 || partes[0].length !== 2 || partes[1].length !== 2 || partes[2].length !== 4) {
        novosErros.dataNascimento = 'Data inválida. Use o formato DD/MM/AAAA'
      }
    }

    if (formData.telefone && !validarTelefone(formData.telefone)) {
      novosErros.telefone = 'Telefone inválido. Deve ter entre 10 e 15 dígitos'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validarFormulario()) {
      // Converter data de DD/MM/AAAA para formato ISO
      let dataNascimentoISO = formData.dataNascimento
      if (formData.dataNascimento && formData.dataNascimento.includes('/')) {
        const partes = formData.dataNascimento.split('/')
        dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`
      }

      const aluno: Aluno = {
        ...formData,
        dataNascimento: dataNascimentoISO,
        status: formData.status || 'Ativo'
      } as Aluno

      storageService.saveAluno(aluno)
      navigate('/alunos')
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Inserir Aluno</h1>
        <button onClick={() => navigate('/alunos')} className="btn btn-secondary">
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="nome">
            Nome <span className="required">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            maxLength={150}
            className={erros.nome ? 'error' : ''}
          />
          {erros.nome && <span className="error-message">{erros.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="numeroMatricula">
            Nº de Matrícula <span className="required">*</span>
          </label>
          <input
            type="text"
            id="numeroMatricula"
            name="numeroMatricula"
            value={formData.numeroMatricula}
            onChange={handleChange}
            maxLength={4}
            className={erros.numeroMatricula ? 'error' : ''}
          />
          {erros.numeroMatricula && <span className="error-message">{erros.numeroMatricula}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="emailInstitucional">
            E-mail Institucional <span className="required">*</span>
          </label>
          <input
            type="email"
            id="emailInstitucional"
            name="emailInstitucional"
            value={formData.emailInstitucional}
            onChange={handleChange}
            maxLength={100}
            placeholder="aluno@dominio.com"
            className={erros.emailInstitucional ? 'error' : ''}
          />
          {erros.emailInstitucional && <span className="error-message">{erros.emailInstitucional}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <input
            type="text"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleDataNascimentoChange}
            placeholder="DD/MM/AAAA"
            maxLength={10}
            className={erros.dataNascimento ? 'error' : ''}
          />
          {erros.dataNascimento && <span className="error-message">{erros.dataNascimento}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            placeholder="(XX) XXXXX-XXXX"
            maxLength={15}
            className={erros.telefone ? 'error' : ''}
          />
          {erros.telefone && <span className="error-message">{erros.telefone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">
            Status <span className="required">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/alunos')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default InserirAluno


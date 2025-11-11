import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { storageService } from '../../services/storage'
import { validarEmail, validarTelefone, formatarData } from '../../utils/validations'
import { Aluno } from '../../types'
import './AlunoForm.css'

const AlterarAluno = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<Partial<Aluno>>({})
  const [erros, setErros] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) {
      const alunos = storageService.getAlunos()
      const aluno = alunos.find(a => a.id === id && a.ativo !== false)
      if (aluno) {
        // Converter data de ISO para DD/MM/AAAA
        let dataNascimentoFormatada = aluno.dataNascimento
        if (aluno.dataNascimento && aluno.dataNascimento.includes('-')) {
          dataNascimentoFormatada = formatarData(aluno.dataNascimento)
        }
        setFormData({
          ...aluno,
          dataNascimento: dataNascimentoFormatada
        })
      }
    }
  }, [id])

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
    if (validarFormulario() && id) {
      // Registrar histórico de alteração
      const alunoOriginal = storageService.getAlunos().find(a => a.id === id)
      if (alunoOriginal) {
        const alteracoes: Record<string, { anterior: any; novo: any }> = {}
        Object.keys(formData).forEach(key => {
          if (key !== 'numeroMatricula' && key !== 'emailInstitucional' && key !== 'dataCadastro') {
            if (JSON.stringify(alunoOriginal[key as keyof Aluno]) !== JSON.stringify(formData[key as keyof Aluno])) {
              alteracoes[key] = {
                anterior: alunoOriginal[key as keyof Aluno],
                novo: formData[key as keyof Aluno]
              }
            }
          }
        })

        if (Object.keys(alteracoes).length > 0) {
          const agora = new Date()
          storageService.saveHistorico({
            entidade: 'Aluno',
            entidadeId: id,
            data: agora.toISOString().split('T')[0],
            hora: agora.toTimeString().split(' ')[0],
            usuario: 'admin', // Em produção viria do contexto de autenticação
            alteracoes
          })
        }
      }

      // Converter data de DD/MM/AAAA para formato ISO
      let dataNascimentoISO = formData.dataNascimento
      if (formData.dataNascimento && formData.dataNascimento.includes('/')) {
        const partes = formData.dataNascimento.split('/')
        dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`
      }

      const aluno: Aluno = {
        ...formData,
        id,
        dataNascimento: dataNascimentoISO,
        // Campos não editáveis mantêm valores originais
        numeroMatricula: alunoOriginal?.numeroMatricula,
        emailInstitucional: alunoOriginal?.emailInstitucional,
        dataCadastro: alunoOriginal?.dataCadastro
      } as Aluno

      storageService.saveAluno(aluno)
      navigate('/alunos')
    }
  }

  if (!formData.id) {
    return <div>Carregando...</div>
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Alterar Aluno</h1>
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
          <label htmlFor="numeroMatricula">Nº de Matrícula</label>
          <input
            type="text"
            id="numeroMatricula"
            name="numeroMatricula"
            value={formData.numeroMatricula}
            disabled
            className="disabled"
          />
          <small className="disabled-note">Este campo não pode ser alterado</small>
        </div>

        <div className="form-group">
          <label htmlFor="emailInstitucional">E-mail Institucional</label>
          <input
            type="email"
            id="emailInstitucional"
            name="emailInstitucional"
            value={formData.emailInstitucional}
            disabled
            className="disabled"
          />
          <small className="disabled-note">Este campo não pode ser alterado</small>
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

        {formData.dataCadastro && (
          <div className="form-group">
            <label>Data de Cadastro</label>
            <input
              type="text"
              value={formatarData(formData.dataCadastro)}
              disabled
              className="disabled"
            />
            <small className="disabled-note">Este campo não pode ser alterado</small>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar Alterações
          </button>
          <button type="button" onClick={() => navigate('/alunos')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default AlterarAluno


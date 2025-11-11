// ==================== CONFIGURAÇÃO INICIAL ====================
// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarAutores();
    carregarAlunos();
});

// ==================== GERENCIAMENTO DE PÁGINAS ====================
function showPage(pageId) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Atualizar navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar página selecionada
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
        page.classList.add('active');
    }
    
    // Atualizar link ativo
    if (pageId === 'home') {
        document.querySelectorAll('.nav-link')[0].classList.add('active');
    } else if (pageId.includes('autor')) {
        document.querySelectorAll('.nav-link')[1].classList.add('active');
    } else if (pageId.includes('aluno')) {
        document.querySelectorAll('.nav-link')[2].classList.add('active');
    }
    
    // Recarregar dados se necessário
    if (pageId === 'consultar-autor') {
        filtrarAutores();
    } else if (pageId === 'consultar-aluno') {
        filtrarAlunos();
    }
}

// ==================== STORAGE SERVICE ====================
const StorageService = {
    // Autores
    getAutores: () => {
        const data = localStorage.getItem('autores');
        return data ? JSON.parse(data) : [];
    },
    
    saveAutor: (autor) => {
        const autores = StorageService.getAutores();
        if (autor.id) {
            const index = autores.findIndex(a => a.id === autor.id);
            if (index !== -1) {
                autores[index] = autor;
            }
        } else {
            autor.id = Date.now().toString();
            autor.ativo = true;
            autores.push(autor);
        }
        localStorage.setItem('autores', JSON.stringify(autores));
    },
    
    deleteAutor: (id) => {
        const autores = StorageService.getAutores();
        const autor = autores.find(a => a.id === id);
        if (autor) {
            autor.ativo = false;
            autor.dataExclusao = new Date().toISOString();
            autor.usuarioExclusao = 'admin';
            StorageService.saveAutor(autor);
        }
    },
    
    // Alunos
    getAlunos: () => {
        const data = localStorage.getItem('alunos');
        return data ? JSON.parse(data) : [];
    },
    
    saveAluno: (aluno) => {
        const alunos = StorageService.getAlunos();
        if (aluno.id) {
            const index = alunos.findIndex(a => a.id === aluno.id);
            if (index !== -1) {
                alunos[index] = aluno;
            }
        } else {
            aluno.id = Date.now().toString();
            aluno.ativo = true;
            aluno.dataCadastro = new Date().toISOString();
            alunos.push(aluno);
        }
        localStorage.setItem('alunos', JSON.stringify(alunos));
    },
    
    deleteAluno: (id) => {
        const alunos = StorageService.getAlunos();
        const aluno = alunos.find(a => a.id === id);
        if (aluno) {
            aluno.ativo = false;
            aluno.dataExclusao = new Date().toISOString();
            StorageService.saveAluno(aluno);
        }
    },
    
    // Histórico
    saveHistorico: (historico) => {
        const historicos = StorageService.getHistoricos();
        historico.id = Date.now().toString();
        historicos.push(historico);
        localStorage.setItem('historico_alteracoes', JSON.stringify(historicos));
    },
    
    getHistoricos: () => {
        const data = localStorage.getItem('historico_alteracoes');
        return data ? JSON.parse(data) : [];
    },
    
    // Verificar se autor está associado a livros
    autorTemLivros: (autorNome) => {
        // Verificar se há livros que referenciam este autor pelo nome
        const livros = JSON.parse(localStorage.getItem('livros') || '[]');
        return livros.some(l => l.ativo && l.autores && l.autores.some(a => a === autorNome || (typeof a === 'string' && a.includes(autorNome))));
    }
};

// ==================== VALIDAÇÕES ====================
function formatarData(data) {
    if (data.includes('/')) return data;
    const partes = data.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

function formatarDataNascimento(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length > 5) {
        value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    input.value = value;
}

function formatarTelefone(input) {
    input.value = input.value.replace(/\D/g, '').slice(0, 15);
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/[-\s()]/g, '');
    return /^\d{10,15}$/.test(telefoneLimpo);
}

// ==================== AUTORES ====================
function salvarAutor(event) {
    event.preventDefault();
    
    // Limpar erros
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error, textarea.error').forEach(el => el.classList.remove('error'));
    
    const nome = document.getElementById('autor-nome').value.trim();
    const nacionalidade = document.getElementById('autor-nacionalidade').value.trim();
    const nascimento = document.getElementById('autor-nascimento').value;
    const biografia = document.getElementById('autor-biografia').value.trim();
    
    // Validações
    let erro = false;
    
    if (!nome || nome.length === 0) {
        document.getElementById('erro-nome-autor').textContent = 'Nome é obrigatório';
        document.getElementById('autor-nome').classList.add('error');
        erro = true;
    } else if (nome.length > 150) {
        document.getElementById('erro-nome-autor').textContent = 'Nome deve ter no máximo 150 caracteres';
        document.getElementById('autor-nome').classList.add('error');
        erro = true;
    }
    
    if (nacionalidade && nacionalidade.length > 100) {
        document.getElementById('erro-nacionalidade').textContent = 'Nacionalidade deve ter no máximo 100 caracteres';
        document.getElementById('autor-nacionalidade').classList.add('error');
        erro = true;
    }
    
    if (nascimento) {
        const partes = nascimento.split('/');
        if (partes.length !== 3 || partes[0].length !== 2 || partes[1].length !== 2 || partes[2].length !== 4) {
            document.getElementById('erro-nascimento-autor').textContent = 'Data inválida. Use o formato DD/MM/AAAA';
            document.getElementById('autor-nascimento').classList.add('error');
            erro = true;
        }
    }
    
    if (biografia && biografia.length > 1000) {
        document.getElementById('erro-biografia').textContent = 'Biografia deve ter no máximo 1000 caracteres';
        document.getElementById('autor-biografia').classList.add('error');
        erro = true;
    }
    
    if (erro) return;
    
    // Converter data
    let dataNascimentoISO = null;
    if (nascimento) {
        const partes = nascimento.split('/');
        if (partes.length === 3) {
            dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    // Salvar
    const autor = {
        nome,
        nacionalidade: nacionalidade || undefined,
        dataNascimento: dataNascimentoISO || undefined,
        biografia: biografia || undefined
    };
    
    StorageService.saveAutor(autor);
    
    // Limpar formulário
    document.getElementById('form-inserir-autor').reset();
    
    alert('Autor cadastrado com sucesso!');
    showPage('consultar-autor');
}

function carregarAutores() {
    filtrarAutores();
}

function filtrarAutores() {
    const autores = StorageService.getAutores().filter(a => a.ativo !== false);
    
    const filtroNome = document.getElementById('filtro-nome-autor')?.value.toLowerCase() || '';
    const filtroNacionalidade = document.getElementById('filtro-nacionalidade-autor')?.value.toLowerCase() || '';
    
    let resultado = autores.filter(autor => {
        if (filtroNome && !autor.nome.toLowerCase().includes(filtroNome)) return false;
        if (filtroNacionalidade && (!autor.nacionalidade || !autor.nacionalidade.toLowerCase().includes(filtroNacionalidade))) return false;
        return true;
    });
    
    // Ordenar alfabeticamente por nome
    resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    
    exibirAutores(resultado);
}

function exibirAutores(autores) {
    const container = document.getElementById('resultados-autores');
    const contador = document.getElementById('contador-autores');
    if (!container) return;
    
    contador.textContent = autores.length;
    
    if (autores.length === 0) {
        container.innerHTML = '<div class="card"><p style="text-align: center; color: #cccccc;">Nenhum autor encontrado com os filtros aplicados.</p></div>';
        return;
    }
    
    container.innerHTML = autores.map(autor => `
        <div class="item-card">
            <div class="item-header">
                <h3>${autor.nome}</h3>
            </div>
            <div class="item-body" id="dados-autor-${autor.id}" style="display: none;">
                ${autor.nacionalidade ? `<p><strong>Nacionalidade:</strong> ${autor.nacionalidade}</p>` : ''}
                ${autor.dataNascimento ? `<p><strong>Data de Nascimento:</strong> ${formatarData(autor.dataNascimento)}</p>` : ''}
                ${autor.biografia ? `<p><strong>Biografia:</strong> ${autor.biografia}</p>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-small btn-primary" onclick="exibirDadosAutor('${autor.id}')">Exibir</button>
                <button class="btn btn-small btn-secondary" onclick="editarAutor('${autor.id}')">Alterar</button>
                <button class="btn btn-small btn-danger" onclick="excluirAutor('${autor.id}')">Remover</button>
            </div>
        </div>
    `).join('');
}

function limparFiltrosAutores() {
    document.getElementById('filtro-nome-autor').value = '';
    document.getElementById('filtro-nacionalidade-autor').value = '';
    filtrarAutores();
}

function exibirDadosAutor(id) {
    const dadosDiv = document.getElementById(`dados-autor-${id}`);
    if (dadosDiv) {
        if (dadosDiv.style.display === 'none') {
            dadosDiv.style.display = 'block';
        } else {
            dadosDiv.style.display = 'none';
        }
    }
}

function editarAutor(id) {
    const autor = StorageService.getAutores().find(a => a.id === id);
    if (!autor) return;
    
    document.getElementById('autor-id-alterar').value = id;
    document.getElementById('autor-nome-alterar').value = autor.nome;
    document.getElementById('autor-nacionalidade-alterar').value = autor.nacionalidade || '';
    document.getElementById('autor-nascimento-alterar').value = autor.dataNascimento ? formatarData(autor.dataNascimento) : '';
    document.getElementById('autor-biografia-alterar').value = autor.biografia || '';
    
    showPage('alterar-autor');
}

function atualizarAutor(event) {
    event.preventDefault();
    
    const id = document.getElementById('autor-id-alterar').value;
    const nome = document.getElementById('autor-nome-alterar').value.trim();
    const nacionalidade = document.getElementById('autor-nacionalidade-alterar').value.trim();
    const nascimento = document.getElementById('autor-nascimento-alterar').value;
    const biografia = document.getElementById('autor-biografia-alterar').value.trim();
    
    const autorOriginal = StorageService.getAutores().find(a => a.id === id);
    if (!autorOriginal) return;
    
    // Validações
    if (!nome || nome.length === 0) {
        alert('Nome é obrigatório');
        return;
    }
    
    if (nome.length > 150) {
        alert('Nome deve ter no máximo 150 caracteres');
        return;
    }
    
    if (nacionalidade && nacionalidade.length > 100) {
        alert('Nacionalidade deve ter no máximo 100 caracteres');
        return;
    }
    
    if (biografia && biografia.length > 1000) {
        alert('Biografia deve ter no máximo 1000 caracteres');
        return;
    }
    
    // Converter data
    let dataNascimentoISO = autorOriginal.dataNascimento;
    if (nascimento) {
        const partes = nascimento.split('/');
        if (partes.length === 3) {
            dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    // Registrar histórico de alteração
    const alteracoes = {};
    Object.keys({nome, nacionalidade, dataNascimento: dataNascimentoISO, biografia}).forEach(key => {
        const valorAnterior = autorOriginal[key];
        const valorNovo = key === 'dataNascimento' ? dataNascimentoISO : (key === 'nome' ? nome : key === 'nacionalidade' ? nacionalidade : biografia);
        if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNovo)) {
            alteracoes[key] = {
                anterior: valorAnterior,
                novo: valorNovo
            };
        }
    });
    
    if (Object.keys(alteracoes).length > 0) {
        const agora = new Date();
        StorageService.saveHistorico({
            entidade: 'Autor',
            entidadeId: id,
            data: agora.toISOString().split('T')[0],
            hora: agora.toTimeString().split(' ')[0],
            usuario: 'admin',
            alteracoes
        });
    }
    
    const autor = {
        ...autorOriginal,
        nome,
        nacionalidade: nacionalidade || undefined,
        dataNascimento: dataNascimentoISO || undefined,
        biografia: biografia || undefined
    };
    
    StorageService.saveAutor(autor);
    alert('Autor atualizado com sucesso!');
    showPage('consultar-autor');
}

function excluirAutor(id) {
    const autor = StorageService.getAutores().find(a => a.id === id);
    if (!autor) return;
    
    // Verificar se autor está associado a livros
    if (StorageService.autorTemLivros(autor.nome)) {
        alert('Não é possível excluir autor associado a livros. Desvincule o autor de todos os livros primeiro.');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o autor ${autor.nome}?`)) {
        const agora = new Date();
        StorageService.deleteAutor(id);
        // Registrar exclusão no histórico
        StorageService.saveHistorico({
            entidade: 'Autor',
            entidadeId: id,
            data: agora.toISOString().split('T')[0],
            hora: agora.toTimeString().split(' ')[0],
            usuario: 'admin',
            alteracoes: { exclusao: { anterior: autor, novo: null } }
        });
        filtrarAutores();
    }
}

// ==================== ALUNOS ====================
function salvarAluno(event) {
    event.preventDefault();
    
    const nome = document.getElementById('aluno-nome').value.trim();
    const matricula = document.getElementById('aluno-matricula').value.trim();
    const email = document.getElementById('aluno-email').value.trim();
    const nascimento = document.getElementById('aluno-nascimento').value;
    const telefone = document.getElementById('aluno-telefone').value;
    const status = 'Ativo'; // Status padrão
    
    // Validações
    if (!nome || nome.length === 0) {
        document.getElementById('erro-nome').textContent = 'Nome é obrigatório';
        document.getElementById('aluno-nome').classList.add('error');
        return;
    }
    if (nome.length > 150) {
        document.getElementById('erro-nome').textContent = 'Nome deve ter no máximo 150 caracteres';
        document.getElementById('aluno-nome').classList.add('error');
        return;
    }
    
    if (!matricula || matricula.length !== 4) {
        document.getElementById('erro-matricula').textContent = 'Nº de Matrícula deve ter exatamente 4 caracteres';
        document.getElementById('aluno-matricula').classList.add('error');
        return;
    }
    
    const alunos = StorageService.getAlunos();
    const alunoExistente = alunos.find(a => a.ativo && a.numeroMatricula === matricula);
    if (alunoExistente) {
        document.getElementById('erro-matricula').textContent = 'Já existe um aluno com este Nº de Matrícula';
        document.getElementById('aluno-matricula').classList.add('error');
        return;
    }
    
    if (!email || !validarEmail(email)) {
        document.getElementById('erro-email').textContent = 'E-mail inválido';
        document.getElementById('aluno-email').classList.add('error');
        return;
    }
    
    const alunoEmailExistente = alunos.find(a => a.ativo && a.emailInstitucional.toLowerCase() === email.toLowerCase());
    if (alunoEmailExistente) {
        document.getElementById('erro-email').textContent = 'Já existe um aluno com este e-mail';
        document.getElementById('aluno-email').classList.add('error');
        return;
    }
    
    if (telefone && !validarTelefone(telefone)) {
        document.getElementById('erro-telefone').textContent = 'Telefone inválido';
        document.getElementById('aluno-telefone').classList.add('error');
        return;
    }
    
    // Converter data
    let dataNascimentoISO = null;
    if (nascimento) {
        const partes = nascimento.split('/');
        if (partes.length === 3) {
            dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    const aluno = {
        nome,
        numeroMatricula: matricula,
        emailInstitucional: email,
        dataNascimento: dataNascimentoISO,
        telefone: telefone || undefined,
        status
    };
    
    StorageService.saveAluno(aluno);
    alert('Aluno cadastrado com sucesso!');
    document.getElementById('form-inserir-aluno').reset();
    showPage('consultar-aluno');
}

function carregarAlunos() {
    filtrarAlunos();
}

function filtrarAlunos() {
    const alunos = StorageService.getAlunos().filter(a => a.ativo !== false);
    
    const filtroNome = document.getElementById('filtro-nome-aluno')?.value.toLowerCase() || '';
    const filtroMatricula = document.getElementById('filtro-matricula-aluno')?.value || '';
    const filtroStatus = document.getElementById('filtro-status-aluno')?.value || '';
    const filtroPendencias = document.getElementById('filtro-pendencias-aluno')?.value || 'Todos';
    
    let resultado = alunos.filter(aluno => {
        if (filtroNome && !aluno.nome.toLowerCase().includes(filtroNome)) return false;
        if (filtroMatricula && aluno.numeroMatricula !== filtroMatricula) return false;
        if (filtroStatus && aluno.status !== filtroStatus) return false;
        if (filtroPendencias !== 'Todos') {
            const temPendencia = aluno.status === 'Suspenso';
            if (filtroPendencias === 'Sim' && !temPendencia) return false;
            if (filtroPendencias === 'Não' && temPendencia) return false;
        }
        return true;
    });
    
    resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    
    exibirAlunos(resultado);
}

function exibirAlunos(alunos) {
    const container = document.getElementById('resultados-alunos');
    const contador = document.getElementById('contador-alunos');
    if (!container) return;
    
    contador.textContent = alunos.length;
    
    if (alunos.length === 0) {
        container.innerHTML = '<div class="card"><p style="text-align: center; color: #cccccc;">Nenhum aluno encontrado com os filtros aplicados.</p></div>';
        return;
    }
    
    container.innerHTML = alunos.map(aluno => `
        <div class="item-card">
            <div class="item-header">
                <h3>${aluno.nome}</h3>
                <span class="status-badge status-${aluno.status.toLowerCase()}">${aluno.status}</span>
            </div>
            <div class="item-body">
                <p><strong>Matrícula:</strong> ${aluno.numeroMatricula}</p>
                <p><strong>E-mail:</strong> ${aluno.emailInstitucional}</p>
                ${aluno.dataNascimento ? `<p><strong>Data de Nascimento:</strong> ${formatarData(aluno.dataNascimento)}</p>` : ''}
                ${aluno.telefone ? `<p><strong>Telefone:</strong> ${aluno.telefone}</p>` : ''}
                ${aluno.dataCadastro ? `<p><strong>Data de Cadastro:</strong> ${formatarDataHora(aluno.dataCadastro)}</p>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editarAluno('${aluno.id}')">Alterar</button>
                <button class="btn btn-small btn-danger" onclick="excluirAluno('${aluno.id}')">Remover</button>
            </div>
        </div>
    `).join('');
}

function limparFiltrosAlunos() {
    document.getElementById('filtro-nome-aluno').value = '';
    document.getElementById('filtro-matricula-aluno').value = '';
    document.getElementById('filtro-status-aluno').value = '';
    document.getElementById('filtro-pendencias-aluno').value = 'Todos';
    filtrarAlunos();
}

function editarAluno(id) {
    const aluno = StorageService.getAlunos().find(a => a.id === id);
    if (!aluno) return;
    
    document.getElementById('aluno-id-alterar').value = id;
    document.getElementById('aluno-nome-alterar').value = aluno.nome;
    document.getElementById('aluno-matricula-alterar').value = aluno.numeroMatricula;
    document.getElementById('aluno-email-alterar').value = aluno.emailInstitucional;
    document.getElementById('aluno-nascimento-alterar').value = aluno.dataNascimento ? formatarData(aluno.dataNascimento) : '';
    document.getElementById('aluno-telefone-alterar').value = aluno.telefone || '';
    document.getElementById('aluno-status-alterar').value = aluno.status;
    
    showPage('alterar-aluno');
}

function atualizarAluno(event) {
    event.preventDefault();
    
    const id = document.getElementById('aluno-id-alterar').value;
    const nome = document.getElementById('aluno-nome-alterar').value.trim();
    const nascimento = document.getElementById('aluno-nascimento-alterar').value;
    const telefone = document.getElementById('aluno-telefone-alterar').value;
    const status = document.getElementById('aluno-status-alterar').value;
    
    const alunoOriginal = StorageService.getAlunos().find(a => a.id === id);
    if (!alunoOriginal) return;
    
    if (!nome || nome.length === 0) {
        alert('Nome é obrigatório');
        return;
    }
    
    if (telefone && !validarTelefone(telefone)) {
        alert('Telefone inválido');
        return;
    }
    
    let dataNascimentoISO = alunoOriginal.dataNascimento;
    if (nascimento) {
        const partes = nascimento.split('/');
        if (partes.length === 3) {
            dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    const aluno = {
        ...alunoOriginal,
        nome,
        dataNascimento: dataNascimentoISO,
        telefone: telefone || undefined,
        status
    };
    
    StorageService.saveAluno(aluno);
    alert('Aluno atualizado com sucesso!');
    showPage('consultar-aluno');
}

function excluirAluno(id) {
    const aluno = StorageService.getAlunos().find(a => a.id === id);
    if (!aluno) return;
    
    if (aluno.status === 'Suspenso') {
        alert('Não é possível excluir aluno com pendências. Resolva as pendências primeiro.');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o aluno ${aluno.nome}?`)) {
        StorageService.deleteAluno(id);
        filtrarAlunos();
    }
}

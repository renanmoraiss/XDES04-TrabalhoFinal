// Utilidades
const STORAGE_KEY = 'alunos';
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
const STORAGE_KEY_AUTORES = 'autores';

function generateId() {
	return crypto?.randomUUID ? crypto.randomUUID() : 'aluno_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function loadAlunos() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list;
	} catch {
		return [];
	}
}

function saveAlunos(alunos) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
}

function loadAutores() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_AUTORES);
		if (!raw) return [];
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list;
	} catch {
		return [];
	}
}

function saveAutores(autores) {
	localStorage.setItem(STORAGE_KEY_AUTORES, JSON.stringify(autores));
}

function formatDateToISO(dateStr) {
	// Se vier yyyy-mm-dd, retorna como está
	return dateStr;
}

function formatDateToDisplay(iso) {
	if (!iso) return '';
	// yyyy-mm-dd -> dd/mm/yyyy
	const [y, m, d] = iso.split('-');
	return `${d}/${m}/${y}`;
}

function formatPhone(value) {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
	const len = digits.length;
	if (!len) return '';
	if (len < 3) return `(${digits}`;
	if (len < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	const prefix = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}`;
	const suffix = digits.slice(7);
	return suffix ? `${prefix}-${suffix}` : prefix;
}

function applyPhoneMask(input) {
	const digits = input.value.replace(/\D/g, '').slice(0, 11);
	input.dataset.digits = digits;
	input.value = formatPhone(digits);
}

function enableEnterNavigation(form, validateForm) {
	if (!form) return;
	form.addEventListener('keydown', (event) => {
		if (event.key !== 'Enter') return;
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		if (target.tagName === 'TEXTAREA') return;
		if (target.closest('button') || target.getAttribute('type') === 'submit') return;
		const focusables = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])'))
			.filter(el => el instanceof HTMLElement && el.tagName !== 'BUTTON' && el.offsetParent !== null);
		const index = focusables.indexOf(target);
		if (index === -1) return;
		event.preventDefault();
		const next = focusables[index + 1];
		if (next) {
			next.focus();
			if (next instanceof HTMLInputElement) next.select?.();
		} else {
			// Está no último campo
			if (validateForm && validateForm()) {
				// Se o formulário está válido, submete
				const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
				if (submitBtn instanceof HTMLElement) {
					submitBtn.click();
				}
			} else {
				// Caso contrário, apenas foca no botão
				const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
				if (submitBtn instanceof HTMLElement) submitBtn.focus();
			}
		}
	});
}

// Validações
const nameRegex = /^[\p{L}\p{M}\s]+$/u; // letras (unicode) e espaços
const digitsRegex = /^\d+$/;
const emailRegex = /^[^\s@]+@atlas\.com\.br$/i;
const allowedStatuses = new Set(['Ativo', 'Inativo', 'Suspenso']);
const lettersAndBasicPunctRegex = /^[\p{L}\p{M}\s.,;:!?'"\-()]*$/u;

function showMessage(el, msg, type = 'error') {
	el.textContent = msg || '';
	el.classList.remove('error', 'success');
	el.classList.add(type);
}

// Dashboard: atualizar contadores
function updateHomeStats() {
	const elAlunos = document.getElementById('stat-total-alunos');
	const elAutores = document.getElementById('stat-total-autores');
	if (elAlunos) elAlunos.textContent = String(loadAlunos().length);
	if (elAutores) elAutores.textContent = String(loadAutores().length);
}

// Navegação simples por hash
function updateViewFromHash() {
	const hash = location.hash || '#/home';
	const homeTab = document.getElementById('tab-home');
	const cadastroTab = document.getElementById('tab-cadastro');
	const consultaTab = document.getElementById('tab-consulta');
	const autorCadastroTab = document.getElementById('tab-autor-cadastro');
	const autorConsultaTab = document.getElementById('tab-autor-consulta');
	const instituicaoTab = document.getElementById('tab-instituicao');
	const homeView = document.getElementById('view-home');
	const cadastroView = document.getElementById('view-cadastro');
	const consultaView = document.getElementById('view-consulta');
	const autorCadastroView = document.getElementById('view-autor-cadastro');
	const autorConsultaView = document.getElementById('view-autor-consulta');
	const instituicaoView = document.getElementById('view-instituicao');

	homeTab.classList.remove('active');
	cadastroTab.classList.remove('active');
	consultaTab.classList.remove('active');
	autorCadastroTab.classList.remove('active');
	autorConsultaTab.classList.remove('active');
	if (instituicaoTab) instituicaoTab.classList.remove('active');
	homeView.classList.add('hidden');
	cadastroView.classList.add('hidden');
	consultaView.classList.add('hidden');
	autorCadastroView.classList.add('hidden');
	autorConsultaView.classList.add('hidden');
	if (instituicaoView) instituicaoView.classList.add('hidden');

	if (hash.startsWith('#/aluno/consulta')) {
		consultaTab.classList.add('active');
		consultaView.classList.remove('hidden');
		renderTabela();
		return;
	}
	if (hash.startsWith('#/aluno/cadastro')) {
		cadastroTab.classList.add('active');
		cadastroView.classList.remove('hidden');
		return;
	}
	if (hash.startsWith('#/autor/consulta')) {
		autorConsultaTab.classList.add('active');
		autorConsultaView.classList.remove('hidden');
		renderTabelaAutores();
		return;
	}
	if (hash.startsWith('#/autor/cadastro')) {
		autorCadastroTab.classList.add('active');
		autorCadastroView.classList.remove('hidden');
		return;
	}
	if (hash.startsWith('#/instituicao') && instituicaoView) {
		if (instituicaoTab) instituicaoTab.classList.add('active');
		instituicaoView.classList.remove('hidden');
		return;
	}
	homeTab.classList.add('active');
	homeView.classList.remove('hidden');
	updateHomeStats();
}

window.addEventListener('hashchange', updateViewFromHash);

// Cadastro
function setupCadastro() {
	const form = document.getElementById('form-cadastro');
	const nome = document.getElementById('nome');
	const matricula = document.getElementById('matricula');
	const email = document.getElementById('email');
	const telefone = document.getElementById('telefone');
	const dataNascimento = document.getElementById('dataNascimento');
	const messages = document.getElementById('cadastro-messages');

	// Função de validação para o formulário de cadastro de aluno
	function validateAlunoForm() {
		const vNome = nome.value.trim();
		const vMatricula = matricula.value.trim();
		const vEmail = email.value.trim().toLowerCase();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vNascimento = dataNascimento.value;

		// Valida campos obrigatórios
		if (!vNome || !nameRegex.test(vNome)) return false;
		if (!vMatricula || !digitsRegex.test(vMatricula) || vMatricula.length !== 4) return false;
		if (!vEmail || !emailRegex.test(vEmail)) return false;
		if (vTelefoneDigits && vTelefoneDigits.length !== 11) return false;
		if (!vNascimento) return false;

		// Verifica unicidade (sem mostrar mensagem de erro)
		const alunos = loadAlunos();
		if (alunos.some(a => a.matricula === vMatricula)) return false;
		if (alunos.some(a => a.email === vEmail)) return false;

		return true;
	}

	enableEnterNavigation(form, validateAlunoForm);

	// Restrições de entrada
	nome.addEventListener('input', () => {
		// permite apenas letras e espaços (remove outros)
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	matricula.addEventListener('input', () => {
		const raw = matricula.value;
		const cleaned = raw.replace(/\D+/g, '');
		if (raw !== cleaned) matricula.value = cleaned;
	});
	telefone.addEventListener('input', () => applyPhoneMask(telefone));
	telefone.addEventListener('blur', () => applyPhoneMask(telefone));

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showMessage(messages, '', 'success');

		const vNome = nome.value.trim();
		const vMatricula = matricula.value.trim();
		const vEmail = email.value.trim().toLowerCase();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vNascimento = dataNascimento.value;

		// Validações
		if (!vNome || !nameRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras e espaços.', 'error');
			nome.focus();
			return;
		}
		if (!vMatricula || !digitsRegex.test(vMatricula) || vMatricula.length !== 4) {
			showMessage(messages, 'Nº de Matrícula é obrigatório, apenas números e com 4 dígitos.', 'error');
			matricula.focus();
			return;
		}
		if (!vEmail || !emailRegex.test(vEmail)) {
			showMessage(messages, 'E-mail institucional é obrigatório e deve terminar com @atlas.com.br.', 'error');
			email.focus();
			return;
		}
		if (vTelefoneDigits) {
			if (vTelefoneDigits.length !== 11) {
				showMessage(messages, 'Telefone deve conter apenas números e ter exatamente 11 dígitos.', 'error');
				telefone.focus();
				return;
			}
		}
		if (!vNascimento) {
			showMessage(messages, 'Data de Nascimento é obrigatória.', 'error');
			dataNascimento.focus();
			return;
		}

		// Regras de unicidade
		const alunos = loadAlunos();
		const existeMatricula = alunos.some(a => a.matricula === vMatricula);
		if (existeMatricula) {
			showMessage(messages, 'Já existe um aluno com este Nº de Matrícula.', 'error');
			matricula.focus();
			return;
		}
		const existeEmail = alunos.some(a => a.email === vEmail);
		if (existeEmail) {
			showMessage(messages, 'Já existe um aluno com este E-mail Institucional.', 'error');
			email.focus();
			return;
		}

		const novoAluno = {
			id: generateId(),
			nome: vNome,
			matricula: vMatricula,
			email: vEmail,
			telefone: vTelefoneDigits,
			dataNascimento: formatDateToISO(vNascimento),
			status: 'Ativo',
			dataCadastro: new Date().toISOString().slice(0, 10) // yyyy-mm-dd
		};

		alunos.push(novoAluno);
		saveAlunos(alunos);
		form.reset();
		delete telefone.dataset.digits;
		showMessage(messages, 'Aluno cadastrado com sucesso!', 'success');
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/aluno/consulta';
		}, 300);
	});
}

// Consulta
function aplicarFiltros(alunos) {
	const nome = document.getElementById('filtroNome').value.trim();
	const matricula = document.getElementById('filtroMatricula').value.trim();
	const status = document.getElementById('filtroStatus').value;

	let resultado = alunos;

	if (nome) {
		const n = nome.toLocaleLowerCase();
		resultado = resultado.filter(a => a.nome.toLocaleLowerCase().includes(n));
	}
	if (matricula) {
		resultado = resultado.filter(a => a.matricula === matricula);
	}
	if (status) {
		resultado = resultado.filter(a => a.status === status);
	}

	// Ordenação alfabética por nome
	resultado.sort((a, b) => collator.compare(a.nome, b.nome));
	return resultado;
}

function renderTabela() {
	const tbody = document.getElementById('tbody-alunos');
	const alunos = loadAlunos();
	const filtrados = aplicarFiltros(alunos);

	if (!filtrados.length) {
		tbody.innerHTML = '<tr><td colspan="7" class="empty">Nenhum aluno encontrado.</td></tr>';
		return;
	}

	tbody.innerHTML = '';
	for (const a of filtrados) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(a.nome)}</td>
			<td>${escapeHtml(a.matricula)}</td>
			<td>${escapeHtml(a.email)}</td>
			<td>${escapeHtml(formatPhone(a.telefone))}</td>
			<td>${escapeHtml(formatDateToDisplay(a.dataNascimento))}</td>
			<td>${escapeHtml(a.status)}</td>
			<td>
				<div class="actions">
					<button class="btn" data-action="editar" data-id="${a.id}">Editar</button>
					<button class="btn danger" data-action="excluir" data-id="${a.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupConsulta() {
	const formFiltro = document.getElementById('form-filtro');
	const btnLimpar = document.getElementById('btnLimparFiltros');
	const tbody = document.getElementById('tbody-alunos');

	formFiltro.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabela();
	});

	btnLimpar.addEventListener('click', () => {
		document.getElementById('filtroNome').value = '';
		document.getElementById('filtroMatricula').value = '';
		document.getElementById('filtroStatus').value = '';
		renderTabela();
	});

	tbody.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar') abrirModalEdicao(id);
		if (action === 'excluir') excluirAluno(id);
	});
}

// Edição
function abrirModalEdicao(id) {
	const alunos = loadAlunos();
	const aluno = alunos.find(a => a.id === id);
	if (!aluno) return;
	document.getElementById('edit-id').value = aluno.id;
	document.getElementById('edit-dataCadastro').value = formatDateToDisplay(aluno.dataCadastro);
	document.getElementById('edit-matricula').value = aluno.matricula;
	document.getElementById('edit-email').value = aluno.email;
	document.getElementById('edit-nome').value = aluno.nome;
	const telefoneInput = document.getElementById('edit-telefone');
	telefoneInput.value = formatPhone(aluno.telefone || '');
	applyPhoneMask(telefoneInput);
	document.getElementById('edit-dataNascimento').value = aluno.dataNascimento;
	document.getElementById('edit-status').value = aluno.status;
	showMessage(document.getElementById('edicao-messages'), '', 'success');
	toggleModal(true);
}

function setupModalEdicao() {
	const overlay = document.getElementById('modal-overlay');
	const form = document.getElementById('form-edicao');
	const btnCancelar = document.getElementById('btnCancelarEdicao');

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) toggleModal(false);
	});
	btnCancelar.addEventListener('click', () => toggleModal(false));

	const nome = document.getElementById('edit-nome');
	const telefone = document.getElementById('edit-telefone');
	const dataNascimento = document.getElementById('edit-dataNascimento');
	const status = document.getElementById('edit-status');
	const messages = document.getElementById('edicao-messages');

	// Restrições
	nome.addEventListener('input', () => {
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	telefone.addEventListener('input', () => applyPhoneMask(telefone));
	telefone.addEventListener('blur', () => applyPhoneMask(telefone));

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const vNome = nome.value.trim();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vNascimento = dataNascimento.value;
		const vStatus = status.value;
		const id = document.getElementById('edit-id').value;

		if (!vNome || !nameRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras e espaços.', 'error');
			nome.focus();
			return;
		}
		if (vTelefoneDigits) {
			if (vTelefoneDigits.length !== 11) {
				showMessage(messages, 'Telefone deve conter apenas números e ter exatamente 11 dígitos.', 'error');
				telefone.focus();
				return;
			}
		}
		if (!vNascimento) {
			showMessage(messages, 'Data de Nascimento é obrigatória.', 'error');
			dataNascimento.focus();
			return;
		}
		if (!vStatus || !allowedStatuses.has(vStatus)) {
			showMessage(messages, 'Status é obrigatório e deve ser Ativo, Inativo ou Suspenso.', 'error');
			status.focus();
			return;
		}

		const alunos = loadAlunos();
		const idx = alunos.findIndex(a => a.id === id);
		if (idx < 0) {
			showMessage(messages, 'Aluno não encontrado.', 'error');
			return;
		}
		// Campos proibidos de alteração: dataCadastro, matricula, email
		alunos[idx] = {
			...alunos[idx],
			nome: vNome,
			telefone: vTelefoneDigits,
			dataNascimento: vNascimento,
			status: vStatus
		};
		saveAlunos(alunos);
		showMessage(messages, 'Aluno atualizado com sucesso!', 'success');
		setTimeout(() => {
			toggleModal(false);
			renderTabela();
		}, 300);
	});
}

function toggleModal(show) {
	const overlay = document.getElementById('modal-overlay');
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirAluno(id) {
	const alunos = loadAlunos();
	const aluno = alunos.find(a => a.id === id);
	if (!aluno) return;
	const ok = confirm(`Excluir o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	const restantes = alunos.filter(a => a.id !== id);
	saveAlunos(restantes);
	renderTabela();
	updateHomeStats();
}

// Segurança simples para imprimir em HTML
function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
	updateViewFromHash();
	setupCadastro();
	setupConsulta();
	setupModalEdicao();
	setupAutorCadastro();
	setupAutorConsulta();
	setupAutorModalEdicao();
	updateHomeStats();

	// Menu hamburguer
	const burgerBtn = document.getElementById('burger-button');
	const burgerMenu = document.getElementById('burger-menu');
	if (burgerBtn && burgerMenu) {
		function closeMenu() {
			burgerBtn.setAttribute('aria-expanded', 'false');
			burgerMenu.setAttribute('aria-hidden', 'true');
			burgerMenu.classList.remove('open');
		}
		burgerBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const isOpen = burgerMenu.classList.toggle('open');
			burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			burgerMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
		});
		document.addEventListener('click', (e) => {
			const target = e.target;
			if (!burgerMenu.contains(target) && target !== burgerBtn) {
				closeMenu();
			}
		});
		burgerMenu.addEventListener('click', (e) => {
			const link = e.target.closest('a');
			if (link) closeMenu();
		});
	}
});

// ==== AUTORES ====
function setupAutorCadastro() {
	const form = document.getElementById('form-autor-cadastro');
	const nome = document.getElementById('autorNome');
	const nacionalidade = document.getElementById('autorNacionalidade');
	const nascimento = document.getElementById('autorNascimento');
	const biografia = document.getElementById('autorBiografia');
	const messages = document.getElementById('autor-cadastro-messages');

	if (!form) return;

	// Função de validação para o formulário de cadastro de autor
	function validateAutorForm() {
		const vNome = nome.value.trim();
		const vNacionalidade = nacionalidade.value.trim();
		const vBiografia = biografia.value.trim();

		// Valida campo obrigatório
		if (!vNome || !nameRegex.test(vNome)) return false;
		// Valida campos opcionais se preenchidos
		if (vNacionalidade && !nameRegex.test(vNacionalidade)) return false;
		if (vBiografia && !lettersAndBasicPunctRegex.test(vBiografia)) return false;

		return true;
	}

	enableEnterNavigation(form, validateAutorForm);

	nome.addEventListener('input', () => {
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	nacionalidade.addEventListener('input', () => {
		const raw = nacionalidade.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nacionalidade.value = cleaned;
	});
	biografia.addEventListener('input', () => {
		const raw = biografia.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) biografia.value = cleaned;
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showMessage(messages, '', 'success');

		const vNome = nome.value.trim();
		const vNacionalidade = nacionalidade.value.trim();
		const vNascimento = nascimento.value; // opcional
		const vBiografia = biografia.value.trim();

		if (!vNome || !nameRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras e espaços.', 'error');
			nome.focus();
			return;
		}
		if (vNacionalidade && !nameRegex.test(vNacionalidade)) {
			showMessage(messages, 'Nacionalidade deve conter apenas letras e espaços.', 'error');
			nacionalidade.focus();
			return;
		}
		if (vBiografia && !lettersAndBasicPunctRegex.test(vBiografia)) {
			showMessage(messages, 'Biografia deve conter apenas letras, espaços e pontuação básica.', 'error');
			biografia.focus();
			return;
		}

		const autores = loadAutores();
		const novoAutor = {
			id: generateId(),
			nome: vNome,
			nacionalidade: vNacionalidade,
			dataNascimento: vNascimento || '',
			biografia: vBiografia
		};
		autores.push(novoAutor);
		saveAutores(autores);
		form.reset();
		showMessage(messages, 'Autor cadastrado com sucesso!', 'success');
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/autor/consulta';
		}, 300);
	});
}

function aplicarFiltrosAutores(autores) {
	const nome = document.getElementById('filtroAutorNome').value.trim();
	const nacionalidade = document.getElementById('filtroAutorNacionalidade').value.trim();
	let resultado = autores;
	if (nome) {
		const n = nome.toLocaleLowerCase();
		resultado = resultado.filter(a => a.nome.toLocaleLowerCase().includes(n));
	}
	if (nacionalidade) {
		const nat = nacionalidade.toLocaleLowerCase();
		resultado = resultado.filter(a => (a.nacionalidade || '').toLocaleLowerCase().includes(nat));
	}
	resultado.sort((a, b) => collator.compare(a.nome, b.nome));
	return resultado;
}

function renderTabelaAutores() {
	const tbody = document.getElementById('tbody-autores');
	if (!tbody) return;
	const autores = loadAutores();
	const filtrados = aplicarFiltrosAutores(autores);
	if (!filtrados.length) {
		tbody.innerHTML = '<tr><td colspan="5" class="empty">Nenhum autor encontrado.</td></tr>';
		return;
	}
	tbody.innerHTML = '';
	for (const a of filtrados) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(a.nome)}</td>
			<td>${escapeHtml(a.nacionalidade || '')}</td>
			<td>${escapeHtml(a.dataNascimento ? formatDateToDisplay(a.dataNascimento) : '')}</td>
			<td>${escapeHtml(a.biografia || '')}</td>
			<td>
				<div class="actions">
					<button class="btn" data-action="editar-autor" data-id="${a.id}">Editar</button>
					<button class="btn danger" data-action="excluir-autor" data-id="${a.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupAutorConsulta() {
	const formFiltro = document.getElementById('form-autor-filtro');
	const btnLimpar = document.getElementById('btnAutorLimparFiltros');
	const tbody = document.getElementById('tbody-autores');
	if (!formFiltro) return;

	formFiltro.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabelaAutores();
	});
	btnLimpar.addEventListener('click', () => {
		document.getElementById('filtroAutorNome').value = '';
		document.getElementById('filtroAutorNacionalidade').value = '';
		renderTabelaAutores();
	});
	tbody.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar-autor') abrirModalAutorEdicao(id);
		if (action === 'excluir-autor') excluirAutor(id);
	});
}

function abrirModalAutorEdicao(id) {
	const autores = loadAutores();
	const autor = autores.find(a => a.id === id);
	if (!autor) return;
	document.getElementById('edit-autor-id').value = autor.id;
	document.getElementById('edit-autor-nome').value = autor.nome;
	document.getElementById('edit-autor-nacionalidade').value = autor.nacionalidade || '';
	document.getElementById('edit-autor-nascimento').value = autor.dataNascimento || '';
	document.getElementById('edit-autor-biografia').value = autor.biografia || '';
	showMessage(document.getElementById('autor-edicao-messages'), '', 'success');
	toggleAutorModal(true);
}

function setupAutorModalEdicao() {
	const overlay = document.getElementById('modal-autor-overlay');
	const form = document.getElementById('form-autor-edicao');
	const btnCancelar = document.getElementById('btnCancelarAutorEdicao');
	if (!form) return;

	const nome = document.getElementById('edit-autor-nome');
	const nacionalidade = document.getElementById('edit-autor-nacionalidade');
	const nascimento = document.getElementById('edit-autor-nascimento');
	const biografia = document.getElementById('edit-autor-biografia');
	const messages = document.getElementById('autor-edicao-messages');

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) toggleAutorModal(false);
	});
	btnCancelar.addEventListener('click', () => toggleAutorModal(false));

	nome.addEventListener('input', () => {
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	nacionalidade.addEventListener('input', () => {
		const raw = nacionalidade.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
		if (raw !== cleaned) nacionalidade.value = cleaned;
	});
	biografia.addEventListener('input', () => {
		const raw = biografia.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) biografia.value = cleaned;
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const vNome = nome.value.trim();
		const vNacionalidade = nacionalidade.value.trim();
		const vNascimento = nascimento.value;
		const vBiografia = biografia.value.trim();
		const id = document.getElementById('edit-autor-id').value;

		if (!vNome || !nameRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras e espaços.', 'error');
			nome.focus();
			return;
		}
		if (vNacionalidade && !nameRegex.test(vNacionalidade)) {
			showMessage(messages, 'Nacionalidade deve conter apenas letras e espaços.', 'error');
			nacionalidade.focus();
			return;
		}
		if (vBiografia && !lettersAndBasicPunctRegex.test(vBiografia)) {
			showMessage(messages, 'Biografia deve conter apenas letras, espaços e pontuação básica.', 'error');
			biografia.focus();
			return;
		}

		const autores = loadAutores();
		const idx = autores.findIndex(a => a.id === id);
		if (idx < 0) {
			showMessage(messages, 'Autor não encontrado.', 'error');
			return;
		}
		autores[idx] = {
			...autores[idx],
			nome: vNome,
			nacionalidade: vNacionalidade,
			dataNascimento: vNascimento || '',
			biografia: vBiografia
		};
		saveAutores(autores);
		showMessage(messages, 'Autor atualizado com sucesso!', 'success');
		setTimeout(() => {
			toggleAutorModal(false);
			renderTabelaAutores();
		}, 300);
	});
}

function toggleAutorModal(show) {
	const overlay = document.getElementById('modal-autor-overlay');
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirAutor(id) {
	const autores = loadAutores();
	const autor = autores.find(a => a.id === id);
	if (!autor) return;
	const ok = confirm(`Excluir o autor "${autor.nome}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	const restantes = autores.filter(a => a.id !== id);
	saveAutores(restantes);
	renderTabelaAutores();
	updateHomeStats();
}
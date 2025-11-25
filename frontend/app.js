const STORAGE_KEY = 'alunos';
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
const STORAGE_KEY_AUTORES = 'autores';
const STORAGE_KEY_EDITORAS = 'editoras';
const STORAGE_KEY_LIVROS = 'livros';
const STORAGE_KEY_EMPRESTIMOS = 'emprestimos';
const STORAGE_KEY_RESERVAS = 'reservas';
const EMPRESTIMO_STATUS = ['Ativo', 'Devolvido', 'Atrasado', 'Perdido'];
const RESERVA_STATUS = ['Ativa', 'Cancelada', 'Expirada', 'Concluída'];
const MAX_EMPRESTIMOS_ATIVOS = 3;
const MAX_RESERVAS_ATIVAS = 3;
const EMPRESTIMO_DIAS_PADRAO = 7;
const RESERVA_DIAS_PADRAO = 5;
const BOOK_GENRES = [
	'Ficção',
	'Ficção Científica',
	'Fantasia',
	'Mistério',
	'Suspense',
	'Romance',
	'Romance Contemporâneo',
	'Romance Histórico',
	'Thriller Psicológico',
	'Terror',
	'Aventura',
	'Distopia',
	'Ficção Histórica',
	'Biografia',
	'Autobiografia',
	'Autoajuda',
	'Negócios',
	'Tecnologia',
	'Programação',
	'Literatura Clássica',
	'Poesia',
	'Infantojuvenil',
	'HQ e Mangá',
	'Literatura Brasileira',
	'Humor',
	'Religião',
	'Espiritualidade',
	'Educação',
	'Culinária'
];

function generateId() {
	return crypto?.randomUUID ? crypto.randomUUID() : 'aluno_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function loadFromStorage(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const list = JSON.parse(raw);
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

function saveToStorage(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}

function loadAlunos() {
	return loadFromStorage(STORAGE_KEY);
}

function saveAlunos(alunos) {
	saveToStorage(STORAGE_KEY, alunos);
	refreshEmprestimoCadastroSelects();
	refreshReservaCadastroSelects();
}

function loadAutores() {
	return loadFromStorage(STORAGE_KEY_AUTORES);
}

function saveAutores(autores) {
	saveToStorage(STORAGE_KEY_AUTORES, autores);
	refreshLivroRelatedSelects();
}

function loadEditoras() {
	return loadFromStorage(STORAGE_KEY_EDITORAS);
}

function saveEditoras(editoras) {
	saveToStorage(STORAGE_KEY_EDITORAS, editoras);
	refreshLivroRelatedSelects();
}

function loadLivros() {
	return loadFromStorage(STORAGE_KEY_LIVROS);
}

function saveLivros(livros) {
	saveToStorage(STORAGE_KEY_LIVROS, livros);
	refreshEmprestimoCadastroSelects();
	refreshReservaCadastroSelects();
}

function loadEmprestimos() {
	return loadFromStorage(STORAGE_KEY_EMPRESTIMOS);
}

function saveEmprestimos(emprestimos) {
	saveToStorage(STORAGE_KEY_EMPRESTIMOS, emprestimos);
	refreshEmprestimoCadastroSelects();
	refreshReservaCadastroSelects();
	updateHomeStats();
}

function loadReservas() {
	return loadFromStorage(STORAGE_KEY_RESERVAS);
}

function saveReservas(reservas) {
	saveToStorage(STORAGE_KEY_RESERVAS, reservas);
	refreshEmprestimoCadastroSelects();
	refreshReservaCadastroSelects();
	updateHomeStats();
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

function formatPhoneEditora(value) {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
	const len = digits.length;
	if (!len) return '';
	if (len <= 4) return digits;
	if (len <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
	if (len <= 11) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
	// Se tiver mais de 11 dígitos (até 13), formata como XXXX XXX XXXX e adiciona o restante
	return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
}

function applyPhoneMask(input) {
	const digits = input.value.replace(/\D/g, '').slice(0, 11);
	input.dataset.digits = digits;
	input.value = formatPhone(digits);
}

function applyPhoneEditoraMask(input) {
	const digits = input.value.replace(/\D/g, '').slice(0, 11);
	input.dataset.digits = digits;
	input.value = formatPhoneEditora(digits);
}

function formatIsbn(value) {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 13);
	if (!digits) return '';
	const segments = [3, 2, 4, 3, 1];
	const parts = [];
	let cursor = 0;
	for (const len of segments) {
		if (digits.length <= cursor) break;
		parts.push(digits.slice(cursor, cursor + len));
		cursor += len;
	}
	return parts.join('-');
}

function applyIsbnMask(input) {
	if (!input) return;
	input.value = formatIsbn(input.value);
}

function getSelectedValues(select) {
	if (!select) return [];
	return Array.from(select.selectedOptions || [])
		.map(opt => opt.value)
		.filter(Boolean);
}

function setSelectValues(select, values = []) {
	if (!select) return;
	const valueSet = new Set(values);
	for (const option of Array.from(select.options || [])) {
		option.selected = valueSet.has(option.value);
	}
	refreshSelectChips(select);
}

function refreshSelectChips(select) {
	if (!select) return;
	const targetId = select.dataset?.chipsTarget;
	if (!targetId) return;
	const container = document.getElementById(targetId);
	updateSelectedChips(select, container);
}

function updateSelectedChips(select, container) {
	if (!select || !container) return;
	const emptyLabel = container.dataset.empty || 'Nenhum item selecionado';
	const selectedOptions = Array.from(select.selectedOptions || []);
	container.innerHTML = '';
	if (!selectedOptions.length) {
		const emptyChip = document.createElement('span');
		emptyChip.className = 'chip empty';
		emptyChip.textContent = emptyLabel;
		container.appendChild(emptyChip);
		return;
	}
	for (const option of selectedOptions) {
		const chip = document.createElement('span');
		chip.className = 'chip';
		const label = document.createElement('span');
		label.textContent = option.textContent;
		chip.appendChild(label);
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.setAttribute('aria-label', `Remover ${option.textContent}`);
		btn.textContent = '×';
		btn.addEventListener('click', () => {
			option.selected = false;
			select.dispatchEvent(new Event('change', { bubbles: true }));
		});
		chip.appendChild(btn);
		container.appendChild(chip);
	}
}

function initSelectedChips(selectId, containerId) {
	const select = document.getElementById(selectId);
	const container = document.getElementById(containerId);
	if (!select || !container) return;
	if (select.dataset.chipsInit === 'true') {
		updateSelectedChips(select, container);
		return;
	}
	enableMultiSelectToggle(select);
	select.dataset.chipsInit = 'true';
	select.dataset.chipsTarget = containerId;
	select.addEventListener('change', () => updateSelectedChips(select, container));
	updateSelectedChips(select, container);
}

function enableMultiSelectToggle(select) {
	if (!select || select.dataset.toggleInit === 'true') return;
	select.dataset.toggleInit = 'true';
	select.addEventListener('mousedown', (event) => {
		const option = event.target;
		if (!(option instanceof HTMLOptionElement)) return;
		event.preventDefault();
		option.selected = !option.selected;
		select.dispatchEvent(new Event('change', { bubbles: true }));
	});
}

function populateGenreSelect(select, includeEmpty = false) {
	if (!select) return;
	const current = new Set(Array.from(select.selectedOptions || []).map(opt => opt.value));
	select.innerHTML = '';
	if (includeEmpty) {
		const opt = document.createElement('option');
		opt.value = '';
		opt.textContent = 'Todos';
		select.appendChild(opt);
	}
	for (const genre of BOOK_GENRES) {
		const option = document.createElement('option');
		option.value = genre;
		option.textContent = genre;
		if (current.has(genre)) option.selected = true;
		select.appendChild(option);
	}
	refreshSelectChips(select);
}

function refreshLivroRelatedSelects() {
	const autores = loadAutores();
	const editoras = loadEditoras();

	const autorSelects = [
		document.getElementById('livroAutores'),
		document.getElementById('edit-livro-autores')
	];
	for (const select of autorSelects) {
		if (!select) continue;
		const selected = new Set(Array.from(select.selectedOptions || []).map(opt => opt.value));
		select.innerHTML = '';
		if (!autores.length) {
			const opt = document.createElement('option');
			opt.value = '';
			opt.textContent = 'Nenhum autor cadastrado.';
			opt.disabled = true;
			select.appendChild(opt);
			refreshSelectChips(select);
			continue;
		}
		for (const autor of autores) {
			const option = document.createElement('option');
			option.value = autor.id;
			option.textContent = autor.nome;
			if (selected.has(autor.id)) option.selected = true;
			select.appendChild(option);
		}
		refreshSelectChips(select);
	}

	const editoraSelects = [
		document.getElementById('livroEditoras'),
		document.getElementById('edit-livro-editoras')
	];
	for (const select of editoraSelects) {
		if (!select) continue;
		const selected = new Set(Array.from(select.selectedOptions || []).map(opt => opt.value));
		select.innerHTML = '';
		if (!editoras.length) {
			const opt = document.createElement('option');
			opt.value = '';
			opt.textContent = 'Nenhuma editora cadastrada.';
			opt.disabled = true;
			select.appendChild(opt);
			refreshSelectChips(select);
			continue;
		}
		for (const editora of editoras) {
			const option = document.createElement('option');
			option.value = editora.id;
			option.textContent = editora.nome;
			if (selected.has(editora.id)) option.selected = true;
			select.appendChild(option);
		}
		refreshSelectChips(select);
	}
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
const allowedEditoraStatuses = new Set(['Ativa', 'Inativa']);
const lettersAndBasicPunctRegex = /^[\p{L}\p{M}\s.,;:!?'"\-()]*$/u;
const lettersAndNumbersRegex = /^[\p{L}\p{M}\p{N}\s.,;:!?'"\-()]*$/u;
const titleRegex = /^[\p{L}\p{M}\p{N}\s]+$/u;
const isbnRegex = /^\d{3}-\d{2}-\d{4}-\d{3}-\d{1}$/;
const yearRegex = /^\d{4}$/;
const HISTORY_STORAGE_KEYS = {
	aluno: { edit: 'hist_aluno_edicoes', delete: 'hist_aluno_exclusoes' },
	autor: { edit: 'hist_autor_edicoes', delete: 'hist_autor_exclusoes' },
	editora: { edit: 'hist_editora_edicoes', delete: 'hist_editora_exclusoes' },
	livro: { edit: 'hist_livro_edicoes', delete: 'hist_livro_exclusoes' },
	emprestimo: { edit: 'hist_emprestimo_edicoes', delete: 'hist_emprestimo_exclusoes' },
	reserva: { edit: 'hist_reserva_edicoes', delete: 'hist_reserva_exclusoes' }
};
const RELATORIO_GENEROS_HISTORY_KEY = 'hist_relatorio_generos';
const RELATORIO_FAIXA_ETARIA_HISTORY_KEY = 'hist_relatorio_faixa_etaria';
let relatorioPieChart = null;
let relatorioBarChart = null;
let relatorioFaixaEtariaBarChart = null;
const RELATORIO_GENRE_COLORS = [
	'#5ad1e6', '#1e74bb', '#7d4ea7', '#b943a7', '#f18cc0',
	'#f6b454', '#68b684', '#5f7adb', '#c6d3e1', '#2c3c5a',
	'#88bef5', '#f9d162', '#f78c6b', '#69cbc1', '#9c73f8'
];
const RELATORIO_CHART_FONT = '"Poppins","Segoe UI",system-ui,-apple-system,sans-serif';
if (typeof Chart !== 'undefined') {
	Chart.defaults.font.family = RELATORIO_CHART_FONT;
	Chart.defaults.color = '#0f172a';
	Chart.defaults.font.size = 12;
}
const ENTITY_LABELS = {
	aluno: 'Alunos',
	autor: 'Autores',
	editora: 'Editoras',
	livro: 'Livros',
	emprestimo: 'Empréstimos',
	reserva: 'Reservas'
};

function showMessage(el, msg, type = 'error') {
	el.textContent = msg || '';
	el.classList.remove('error', 'success');
	el.classList.add(type);
}

function enforceNumericInput(input, maxLength) {
	if (!input) return;
	input.addEventListener('input', () => {
		const digits = input.value.replace(/\D+/g, '');
		const sliced = typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
		if (input.value !== sliced) input.value = sliced;
	});
}

function enforceInputPattern(input, pattern) {
	if (!input) return;
	input.addEventListener('input', () => {
		const raw = input.value;
		const cleaned = raw.normalize('NFC').replace(pattern, '');
		if (raw !== cleaned) input.value = cleaned;
	});
}

const INPUT_PATTERNS = {
	lettersOnly: /[^\p{L}\p{M}\s]/gu,
	lettersAndNumbers: /[^\p{L}\p{M}\p{N}\s]/gu,
	lettersNumbersPunct: /[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu
};

function cloneRecord(record) {
	if (!record) return null;
	if (typeof structuredClone === 'function') {
		try { return structuredClone(record); } catch { /* falls through */ }
	}
	return JSON.parse(JSON.stringify(record));
}

function findAlunoById(id) {
	if (!id) return null;
	return loadAlunos().find(aluno => aluno.id === id) || null;
}

function findLivroById(id) {
	if (!id) return null;
	return loadLivros().find(livro => livro.id === id) || null;
}

function formatAlunoLabel(aluno) {
	if (!aluno) return 'Aluno removido';
	return `${aluno.nome} (Matrícula ${aluno.matricula})`;
}

function formatLivroLabel(livro) {
	if (!livro) return 'Livro removido';
	return `${livro.titulo} (ISBN ${livro.isbn})`;
}

function isRegistroAtivo(registro) {
	return registro?.ativo !== false;
}

function refreshEmprestimoAutomaticStatuses() {
	const emprestimos = loadEmprestimos();
	let changed = false;
	const today = getTodayDateInputValue();
	for (const emprestimo of emprestimos) {
		if (emprestimo.ativo === false) continue;
		if (emprestimo.status === 'Devolvido' || emprestimo.status === 'Perdido') continue;
		if (emprestimo.dataDevolucaoPrevista) {
			// Atualizar para 'Atrasado' se a data foi ultrapassada
			if ((emprestimo.status === 'Ativo' || emprestimo.status === 'Atrasado') && emprestimo.dataDevolucaoPrevista < today) {
				if (emprestimo.status !== 'Atrasado') {
					emprestimo.status = 'Atrasado';
					changed = true;
				}
			} else if (emprestimo.status === 'Atrasado' && emprestimo.dataDevolucaoPrevista >= today) {
				// Corrigir status se não deveria estar atrasado
				emprestimo.status = 'Ativo';
				changed = true;
			}
		}
	}
	if (changed) saveEmprestimos(emprestimos);
	return emprestimos;
}

function refreshReservaAutomaticStatuses() {
	const reservas = loadReservas();
	let changed = false;
	const today = getTodayDateInputValue();
	for (const reserva of reservas) {
		if (reserva.ativo === false) continue;
		if (reserva.status === 'Cancelada' || reserva.status === 'Concluída') continue;
		if (reserva.dataExpiracao) {
			// Atualizar para 'Expirada' se a data foi ultrapassada
			if ((reserva.status === 'Ativa' || reserva.status === 'Expirada') && reserva.dataExpiracao < today) {
				if (reserva.status !== 'Expirada') {
					reserva.status = 'Expirada';
					changed = true;
				}
			} else if (reserva.status === 'Expirada' && reserva.dataExpiracao >= today) {
				// Corrigir status se não deveria estar expirada
				reserva.status = 'Ativa';
				changed = true;
			}
		}
	}
	if (changed) saveReservas(reservas);
	return reservas;
}

function countEmprestimosAtivosAluno(alunoId) {
	if (!alunoId) return 0;
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	return emprestimos.filter(e => e.alunoId === alunoId && isRegistroAtivo(e) && e.status === 'Ativo').length;
}

function alunoPossuiEmprestimoAtrasado(alunoId) {
	if (!alunoId) return false;
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	return emprestimos.some(e => e.alunoId === alunoId && isRegistroAtivo(e) && e.status === 'Atrasado');
}

function alunoPossuiPendencias(alunoId) {
	if (!alunoId) return false;
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	return emprestimos.some(e =>
		e.alunoId === alunoId &&
		isRegistroAtivo(e) &&
		['Ativo', 'Atrasado', 'Perdido'].includes(e.status)
	);
}

function livroCopiasDisponiveis(livroId) {
	const livro = findLivroById(livroId);
	if (!livro) return 0;
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const emprestados = emprestimos.filter(e =>
		e.livroId === livroId &&
		isRegistroAtivo(e) &&
		(e.status === 'Ativo' || e.status === 'Atrasado')
	).length;
	const total = Number(livro.exemplares) || 0;
	return Math.max(0, total - emprestados);
}

function countReservasAtivasAluno(alunoId) {
	if (!alunoId) return 0;
	const reservas = refreshReservaAutomaticStatuses();
	return reservas.filter(r => r.alunoId === alunoId && isRegistroAtivo(r) && r.status === 'Ativa').length;
}

function existeReservaAtivaParaLivro(livroId, alunoId) {
	if (!livroId) return { possui: false, reservadaPorOutro: false, reservaDoAluno: null };
	const reservas = refreshReservaAutomaticStatuses();
	let reservadaPorOutro = false;
	let reservaDoAluno = null;
	for (const reserva of reservas) {
		if (!isRegistroAtivo(reserva)) continue;
		if (reserva.livroId !== livroId) continue;
		if (reserva.status !== 'Ativa') continue;
		if (alunoId && reserva.alunoId === alunoId) {
			reservaDoAluno = reserva;
		} else {
			reservadaPorOutro = true;
		}
	}
	return {
		possui: reservadaPorOutro || Boolean(reservaDoAluno),
		reservadaPorOutro,
		reservaDoAluno
	};
}

function existeReservaAtivaDuplicada(alunoId, livroId) {
	if (!alunoId || !livroId) return false;
	const reservas = refreshReservaAutomaticStatuses();
	return reservas.some(r =>
		isRegistroAtivo(r) &&
		r.alunoId === alunoId &&
		r.livroId === livroId &&
		r.status === 'Ativa'
	);
}

function livroTemEspacoParaReserva(livroId) {
	const livro = findLivroById(livroId);
	if (!livro) return false;
	const reservas = refreshReservaAutomaticStatuses();
	const reservadas = reservas.filter(r =>
		isRegistroAtivo(r) &&
		r.livroId === livroId &&
		r.status === 'Ativa'
	).length;
	const total = Number(livro.exemplares) || 0;
	return reservadas < total;
}

function populateEmprestimoAlunoSelect(select) {
	if (!select) return;
	const alunos = loadAlunos().filter(a => a.status === 'Ativo');
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const ativosPorAluno = new Map();
	const atrasadosPorAluno = new Set();
	for (const emprestimo of emprestimos) {
		if (!isRegistroAtivo(emprestimo) || !emprestimo.alunoId) continue;
		if (emprestimo.status === 'Ativo') {
			ativosPorAluno.set(emprestimo.alunoId, (ativosPorAluno.get(emprestimo.alunoId) || 0) + 1);
		}
		if (emprestimo.status === 'Atrasado') {
			atrasadosPorAluno.add(emprestimo.alunoId);
		}
	}
	const fragment = document.createDocumentFragment();
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = 'Selecione um aluno ativo';
	fragment.appendChild(placeholder);
	for (const aluno of alunos) {
		const option = document.createElement('option');
		option.value = aluno.id;
		const emprestimosAtivos = ativosPorAluno.get(aluno.id) || 0;
		const temAtraso = atrasadosPorAluno.has(aluno.id);
		option.textContent = `${aluno.nome} • Matrícula ${aluno.matricula}${emprestimosAtivos ? ` • ${emprestimosAtivos} ativo(s)` : ''}`;
		if (temAtraso) {
			option.disabled = true;
			option.textContent += ' • Pendências em aberto';
		} else if (emprestimosAtivos >= MAX_EMPRESTIMOS_ATIVOS) {
			option.disabled = true;
			option.textContent += ` • Limite (${MAX_EMPRESTIMOS_ATIVOS}) atingido`;
		}
		fragment.appendChild(option);
	}
	select.innerHTML = '';
	select.appendChild(fragment);
}

function populateEmprestimoLivroSelect(select) {
	if (!select) return;
	const livros = loadLivros();
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const reservas = refreshReservaAutomaticStatuses();
	const emprestimosPorLivro = new Map();
	for (const emprestimo of emprestimos) {
		if (!isRegistroAtivo(emprestimo) || !emprestimo.livroId) continue;
		if (emprestimo.status === 'Ativo' || emprestimo.status === 'Atrasado') {
			emprestimosPorLivro.set(emprestimo.livroId, (emprestimosPorLivro.get(emprestimo.livroId) || 0) + 1);
		}
	}
	const reservasPorLivro = new Map();
	for (const reserva of reservas) {
		if (!isRegistroAtivo(reserva) || reserva.status !== 'Ativa' || !reserva.livroId) continue;
		reservasPorLivro.set(reserva.livroId, (reservasPorLivro.get(reserva.livroId) || 0) + 1);
	}
	const fragment = document.createDocumentFragment();
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = 'Selecione um livro';
	fragment.appendChild(placeholder);
	for (const livro of livros) {
		const option = document.createElement('option');
		option.value = livro.id;
		const total = Number(livro.exemplares) || 0;
		const emprestados = emprestimosPorLivro.get(livro.id) || 0;
		const disponiveis = Math.max(0, total - emprestados);
		const reservasAtivas = reservasPorLivro.get(livro.id) || 0;
		option.textContent = `${livro.titulo} • ISBN ${livro.isbn} • Disp.: ${disponiveis}`;
		if (disponiveis <= 0) {
			option.disabled = true;
			option.textContent += ' • Sem exemplares';
		}
		if (reservasAtivas > 0) {
			option.textContent += ` • ${reservasAtivas} reserva(s) ativa(s)`;
		}
		fragment.appendChild(option);
	}
	select.innerHTML = '';
	select.appendChild(fragment);
}

function populateReservaAlunoSelect(select) {
	if (!select) return;
	const alunos = loadAlunos().filter(a => a.status === 'Ativo');
	const reservas = refreshReservaAutomaticStatuses();
	const reservasPorAluno = new Map();
	for (const reserva of reservas) {
		if (!isRegistroAtivo(reserva) || reserva.status !== 'Ativa' || !reserva.alunoId) continue;
		reservasPorAluno.set(reserva.alunoId, (reservasPorAluno.get(reserva.alunoId) || 0) + 1);
	}
	const fragment = document.createDocumentFragment();
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = 'Selecione um aluno ativo';
	fragment.appendChild(placeholder);
	for (const aluno of alunos) {
		const option = document.createElement('option');
		option.value = aluno.id;
		const reservasAtivas = reservasPorAluno.get(aluno.id) || 0;
		option.textContent = `${aluno.nome} • Matrícula ${aluno.matricula}${reservasAtivas ? ` • ${reservasAtivas} reserva(s)` : ''}`;
		if (reservasAtivas >= MAX_RESERVAS_ATIVAS) {
			option.disabled = true;
			option.textContent += ` • Limite (${MAX_RESERVAS_ATIVAS}) atingido`;
		}
		fragment.appendChild(option);
	}
	select.innerHTML = '';
	select.appendChild(fragment);
}

function populateReservaLivroSelect(select) {
	if (!select) return;
	const livros = loadLivros();
	const reservas = refreshReservaAutomaticStatuses();
	const reservasPorLivro = new Map();
	for (const reserva of reservas) {
		if (!isRegistroAtivo(reserva) || reserva.status !== 'Ativa' || !reserva.livroId) continue;
		reservasPorLivro.set(reserva.livroId, (reservasPorLivro.get(reserva.livroId) || 0) + 1);
	}
	const fragment = document.createDocumentFragment();
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = 'Selecione um livro';
	fragment.appendChild(placeholder);
	for (const livro of livros) {
		const option = document.createElement('option');
		option.value = livro.id;
		const total = Number(livro.exemplares) || 0;
		const reservasAtivas = reservasPorLivro.get(livro.id) || 0;
		option.textContent = `${livro.titulo} • ISBN ${livro.isbn} • Reservas: ${reservasAtivas}/${total}`;
		if (reservasAtivas >= total) {
			option.disabled = true;
			option.textContent += ' • Sem vagas para reserva';
		}
		fragment.appendChild(option);
	}
	select.innerHTML = '';
	select.appendChild(fragment);
}

function refreshEmprestimoCadastroSelects() {
	populateEmprestimoAlunoSelect(document.getElementById('emprestimoAluno'));
	populateEmprestimoLivroSelect(document.getElementById('emprestimoLivro'));
}

function refreshReservaCadastroSelects() {
	populateReservaAlunoSelect(document.getElementById('reservaAluno'));
	populateReservaLivroSelect(document.getElementById('reservaLivro'));
}

function livroPossuiEmprestimosPendentes(livroId) {
	if (!livroId) return false;
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	return emprestimos.some(e =>
		e.livroId === livroId &&
		isRegistroAtivo(e) &&
		['Ativo', 'Atrasado', 'Perdido'].includes(e.status)
	);
}

function resetEmprestimoCadastroDefaults(force = false) {
	const dataInput = document.getElementById('emprestimoData');
	const dataPrevistaInput = document.getElementById('emprestimoDataPrevista');
	const statusSelect = document.getElementById('emprestimoStatus');
	if (dataInput) {
		const now = nowIsoString();
		dataInput.value = formatDateTimeDisplay(now);
		dataInput.dataset.iso = now;
		dataInput.required = true;
	}
	if (dataPrevistaInput && (force || !dataPrevistaInput.value)) {
		dataPrevistaInput.value = dateToInputValue(addDays(new Date(), EMPRESTIMO_DIAS_PADRAO));
	}
	if (statusSelect) {
		statusSelect.required = true;
		if (force || !statusSelect.value) statusSelect.value = 'Ativo';
	}
}

function resetReservaCadastroDefaults(force = false) {
	const dataInput = document.getElementById('reservaData');
	const dataExpiracaoInput = document.getElementById('reservaDataExpiracao');
	const statusSelect = document.getElementById('reservaStatus');
	if (dataInput) {
		const now = nowIsoString();
		dataInput.value = formatDateTimeDisplay(now);
		dataInput.dataset.iso = now;
		dataInput.required = true;
	}
	if (dataExpiracaoInput && (force || !dataExpiracaoInput.value)) {
		dataExpiracaoInput.value = dateToInputValue(addDays(new Date(), RESERVA_DIAS_PADRAO));
	}
	if (statusSelect) {
		statusSelect.required = true;
		if (force || !statusSelect.value) statusSelect.value = 'Ativa';
	}
}

function formatDateTimeDisplay(iso) {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString('pt-BR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function getTodayDateInputValue() {
	const now = new Date();
	const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
	return tzAdjusted.toISOString().slice(0, 10);
}

function dateToInputValue(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
	const tzAdjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return tzAdjusted.toISOString().slice(0, 10);
}

function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function nowIsoString() {
	return new Date().toISOString();
}

function loadHistoryEntries(entity, type) {
	const key = HISTORY_STORAGE_KEYS[entity]?.[type];
	if (!key) return [];
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const entries = JSON.parse(raw);
		return Array.isArray(entries) ? entries : [];
	} catch {
		return [];
	}
}

function recordHistory(entity, type, record, previousRecord = null) {
	const key = HISTORY_STORAGE_KEYS[entity]?.[type];
	if (!key || !record) return;
	const entries = loadHistoryEntries(entity, type);
	const entry = {
		dataHora: new Date().toISOString(),
		usuario: 'Bibliotecário'
	};
	if (type === 'edit') {
		entry.alteracoes = buildHistoryDiff(entity, previousRecord, record);
	} else {
		entry.dados = buildHistorySnapshot(entity, record);
	}
	entries.push(entry);
	localStorage.setItem(key, JSON.stringify(entries));
}

function getEntityDisplayData(entity, record) {
	if (!record) return {};
	const snapshot = {};
	switch (entity) {
		case 'aluno':
			snapshot['Nome'] = record.nome;
			snapshot['Nº Matrícula'] = record.matricula;
			snapshot['E-mail'] = record.email;
			snapshot['Telefone'] = formatPhone(record.telefone || '');
			snapshot['Data de Nascimento'] = formatDateToDisplay(record.dataNascimento);
			snapshot['Status'] = record.status;
			break;
		case 'autor':
			snapshot['Nome'] = record.nome;
			snapshot['Nacionalidade'] = record.nacionalidade || '';
			snapshot['Data de Nascimento'] = record.dataNascimento ? formatDateToDisplay(record.dataNascimento) : '';
			snapshot['Biografia'] = record.biografia || '';
			break;
		case 'editora':
			snapshot['Nome'] = record.nome;
			snapshot['Telefone'] = formatPhoneEditora(record.telefone || '');
			snapshot['Endereço Comercial'] = record.enderecoComercial || '';
			snapshot['Status'] = record.status;
			break;
		case 'livro':
			{
				const autoresMap = new Map(loadAutores().map(a => [a.id, a.nome]));
				const editorasMap = new Map(loadEditoras().map(e => [e.id, e.nome]));
				const autores = (record.autorIds || []).map(id => autoresMap.get(id) || 'Autor removido').join(', ');
				const editoras = (record.editoraIds || []).map(id => editorasMap.get(id) || 'Editora removida').join(', ');
				snapshot['Título'] = record.titulo;
				snapshot['Autores'] = autores || '';
				snapshot['Gêneros'] = (record.generos || []).join(', ');
				snapshot['Editoras'] = editoras || '';
				snapshot['ISBN'] = record.isbn;
				snapshot['Exemplares'] = record.exemplares;
				snapshot['Ano de Publicação'] = record.anoPublicacao || '';
				snapshot['Localização Física'] = record.localizacao || '';
			}
			break;
		case 'emprestimo':
			{
				const aluno = findAlunoById(record.alunoId);
				const livro = findLivroById(record.livroId);
				snapshot['Aluno'] = formatAlunoLabel(aluno);
				snapshot['Livro'] = formatLivroLabel(livro);
				snapshot['Data de Empréstimo'] = formatDateTimeDisplay(record.dataEmprestimo);
				snapshot['Data de Devolução Prevista'] = formatDateToDisplay(record.dataDevolucaoPrevista);
				if (record.dataDevolucaoReal) {
					snapshot['Data de Devolução Real'] = formatDateTimeDisplay(record.dataDevolucaoReal);
				}
				snapshot['Status'] = record.status;
			}
			break;
		case 'reserva':
			{
				const aluno = findAlunoById(record.alunoId);
				const livro = findLivroById(record.livroId);
				snapshot['Aluno'] = formatAlunoLabel(aluno);
				snapshot['Livro'] = formatLivroLabel(livro);
				snapshot['Data de Reserva'] = formatDateTimeDisplay(record.dataReserva);
				snapshot['Data de Expiração'] = formatDateToDisplay(record.dataExpiracao);
				snapshot['Status'] = record.status;
			}
			break;
		default:
			Object.assign(snapshot, record);
	}
	return snapshot;
}

function buildHistorySnapshot(entity, record) {
	return getEntityDisplayData(entity, record);
}

function buildHistoryDiff(entity, before = {}, after = {}) {
	const beforeData = getEntityDisplayData(entity, before) || {};
	const afterData = getEntityDisplayData(entity, after) || {};
	const labels = new Set([...Object.keys(beforeData), ...Object.keys(afterData)]);
	const diff = [];
	for (const label of labels) {
		const prev = beforeData[label] ?? '';
		const next = afterData[label] ?? '';
		if (prev === next) continue;
		diff.push({
			campo: label,
			antes: prev,
			depois: next
		});
	}
	return diff;
}

function openHistoryModal(entity, type) {
	const overlay = document.getElementById('history-overlay');
	const title = document.getElementById('history-title');
	const list = document.getElementById('history-content');
	if (!overlay || !title || !list) return;
	const entityLabel = ENTITY_LABELS[entity] || '';
	const actionLabel = type === 'edit' ? 'Edições' : 'Exclusões';
	title.textContent = `Histórico de ${actionLabel} - ${entityLabel}`;
	const entries = loadHistoryEntries(entity, type);
	list.innerHTML = '';
	if (!entries.length) {
		const li = document.createElement('li');
		li.className = 'empty';
		li.textContent = 'Nenhum registro encontrado.';
		list.appendChild(li);
	} else {
		for (const entry of [...entries].reverse()) {
			const li = document.createElement('li');
			const meta = document.createElement('div');
			meta.className = 'history-meta';
			meta.textContent = `${formatDateTimeDisplay(entry.dataHora)} - ${entry.usuario || 'Bibliotecário'}`;
			const dataDiv = document.createElement('div');
			dataDiv.className = 'history-data';
			dataDiv.innerHTML = type === 'edit'
				? formatHistoryChanges(entry.alteracoes)
				: formatHistoryData(entry.dados);
			li.appendChild(meta);
			li.appendChild(dataDiv);
			list.appendChild(li);
		}
	}
	toggleHistoryModal(true);
}

function formatHistoryData(data = {}) {
	const fragments = [];
	for (const [label, value] of Object.entries(data)) {
		if (value === undefined || value === null || value === '') continue;
		fragments.push(`<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</div>`);
	}
	if (!fragments.length) {
		return '<div><em>Sem informações adicionais.</em></div>';
	}
	return fragments.join('');
}

function formatHistoryChanges(changes = []) {
	if (!changes || !changes.length) {
		return '<div><em>Nenhuma alteração registrada.</em></div>';
	}
	const fragments = [];
	for (const change of changes) {
		const before = change.antes === undefined || change.antes === '' ? '—' : change.antes;
		const after = change.depois === undefined || change.depois === '' ? '—' : change.depois;
		fragments.push(
			`<div><strong>${escapeHtml(change.campo)}:</strong> ${escapeHtml(String(before))} → ${escapeHtml(String(after))}</div>`
		);
	}
	return fragments.join('');
}

function loadRelatorioGenerosHistory() {
	try {
		const raw = localStorage.getItem(RELATORIO_GENEROS_HISTORY_KEY);
		if (!raw) return [];
		const list = JSON.parse(raw);
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

function saveRelatorioGenerosHistory(entries) {
	localStorage.setItem(RELATORIO_GENEROS_HISTORY_KEY, JSON.stringify(entries));
}

function loadRelatorioFaixaEtariaHistory() {
	try {
		const raw = localStorage.getItem(RELATORIO_FAIXA_ETARIA_HISTORY_KEY);
		if (!raw) return [];
		const list = JSON.parse(raw);
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

function saveRelatorioFaixaEtariaHistory(entries) {
	localStorage.setItem(RELATORIO_FAIXA_ETARIA_HISTORY_KEY, JSON.stringify(entries));
}

function toggleHistoryModal(show) {
	const overlay = document.getElementById('history-overlay');
	if (!overlay) return;
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function setupHistoryUI() {
	const overlay = document.getElementById('history-overlay');
	const closeBtn = document.getElementById('btnHistoryClose');
	closeBtn?.addEventListener('click', () => toggleHistoryModal(false));
	overlay?.addEventListener('click', (e) => {
		if (e.target === overlay) toggleHistoryModal(false);
	});
	const triggers = document.querySelectorAll('[data-history-entity][data-history-type]');
	triggers.forEach(btn => {
		btn.addEventListener('click', () => openHistoryModal(btn.dataset.historyEntity, btn.dataset.historyType));
	});
}

// Dashboard: atualizar contadores
function updateHomeStats() {
	const elAlunos = document.getElementById('stat-total-alunos');
	const elAutores = document.getElementById('stat-total-autores');
	const elEditoras = document.getElementById('stat-total-editoras');
	const elLivros = document.getElementById('stat-total-livros');
	const elEmprestimos = document.getElementById('stat-total-emprestimos');
	const elReservas = document.getElementById('stat-total-reservas');
	if (elAlunos) elAlunos.textContent = String(loadAlunos().length);
	if (elAutores) elAutores.textContent = String(loadAutores().length);
	if (elEditoras) elEditoras.textContent = String(loadEditoras().length);
	if (elLivros) elLivros.textContent = String(loadLivros().length);
	if (elEmprestimos) elEmprestimos.textContent = String(loadEmprestimos().filter(isRegistroAtivo).length);
	if (elReservas) elReservas.textContent = String(loadReservas().filter(isRegistroAtivo).length);
}

// Navegação simples por hash
function updateViewFromHash() {
	const hash = location.hash || '#/home';
	const homeTab = document.getElementById('tab-home');
	const cadastroTab = document.getElementById('tab-cadastro');
	const consultaTab = document.getElementById('tab-consulta');
	const autorCadastroTab = document.getElementById('tab-autor-cadastro');
	const autorConsultaTab = document.getElementById('tab-autor-consulta');
	const editoraCadastroTab = document.getElementById('tab-editora-cadastro');
	const editoraConsultaTab = document.getElementById('tab-editora-consulta');
	const livroCadastroTab = document.getElementById('tab-livro-cadastro');
	const livroConsultaTab = document.getElementById('tab-livro-consulta');
	const instituicaoTab = document.getElementById('tab-instituicao');
	const relatoriosTab = document.getElementById('tab-relatorios');
	const relatoriosFaixaEtariaTab = document.getElementById('tab-relatorios-faixa-etaria');
	const emprestimoCadastroTab = document.getElementById('tab-emprestimo-cadastro');
	const emprestimoConsultaTab = document.getElementById('tab-emprestimo-consulta');
	const reservaCadastroTab = document.getElementById('tab-reserva-cadastro');
	const reservaConsultaTab = document.getElementById('tab-reserva-consulta');
	const homeView = document.getElementById('view-home');
	const cadastroView = document.getElementById('view-cadastro');
	const consultaView = document.getElementById('view-consulta');
	const autorCadastroView = document.getElementById('view-autor-cadastro');
	const autorConsultaView = document.getElementById('view-autor-consulta');
	const editoraCadastroView = document.getElementById('view-editora-cadastro');
	const editoraConsultaView = document.getElementById('view-editora-consulta');
	const livroCadastroView = document.getElementById('view-livro-cadastro');
	const livroConsultaView = document.getElementById('view-livro-consulta');
	const instituicaoView = document.getElementById('view-instituicao');
	const emprestimoCadastroView = document.getElementById('view-emprestimo-cadastro');
	const emprestimoConsultaView = document.getElementById('view-emprestimo-consulta');
	const reservaCadastroView = document.getElementById('view-reserva-cadastro');
	const reservaConsultaView = document.getElementById('view-reserva-consulta');
	const relatoriosView = document.getElementById('view-relatorios');
	const relatoriosFaixaEtariaView = document.getElementById('view-relatorios-faixa-etaria');

	homeTab.classList.remove('active');
	cadastroTab.classList.remove('active');
	consultaTab.classList.remove('active');
	autorCadastroTab.classList.remove('active');
	autorConsultaTab.classList.remove('active');
	if (editoraCadastroTab) editoraCadastroTab.classList.remove('active');
	if (editoraConsultaTab) editoraConsultaTab.classList.remove('active');
	if (livroCadastroTab) livroCadastroTab.classList.remove('active');
	if (livroConsultaTab) livroConsultaTab.classList.remove('active');
	if (instituicaoTab) instituicaoTab.classList.remove('active');
	if (emprestimoCadastroTab) emprestimoCadastroTab.classList.remove('active');
	if (emprestimoConsultaTab) emprestimoConsultaTab.classList.remove('active');
	if (reservaCadastroTab) reservaCadastroTab.classList.remove('active');
	if (reservaConsultaTab) reservaConsultaTab.classList.remove('active');
	if (relatoriosTab) relatoriosTab.classList.remove('active');
	if (relatoriosFaixaEtariaTab) relatoriosFaixaEtariaTab.classList.remove('active');
	homeView.classList.add('hidden');
	cadastroView.classList.add('hidden');
	consultaView.classList.add('hidden');
	autorCadastroView.classList.add('hidden');
	autorConsultaView.classList.add('hidden');
	if (editoraCadastroView) editoraCadastroView.classList.add('hidden');
	if (editoraConsultaView) editoraConsultaView.classList.add('hidden');
	if (livroCadastroView) livroCadastroView.classList.add('hidden');
	if (livroConsultaView) livroConsultaView.classList.add('hidden');
	if (instituicaoView) instituicaoView.classList.add('hidden');
	if (emprestimoCadastroView) emprestimoCadastroView.classList.add('hidden');
	if (emprestimoConsultaView) emprestimoConsultaView.classList.add('hidden');
	if (reservaCadastroView) reservaCadastroView.classList.add('hidden');
	if (reservaConsultaView) reservaConsultaView.classList.add('hidden');
	if (relatoriosView) relatoriosView.classList.add('hidden');
	if (relatoriosFaixaEtariaView) relatoriosFaixaEtariaView.classList.add('hidden');

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
	if (hash.startsWith('#/editora/consulta')) {
		if (editoraConsultaTab) editoraConsultaTab.classList.add('active');
		if (editoraConsultaView) {
			editoraConsultaView.classList.remove('hidden');
			renderTabelaEditoras();
		}
		return;
	}
	if (hash.startsWith('#/editora/cadastro')) {
		if (editoraCadastroTab) editoraCadastroTab.classList.add('active');
		if (editoraCadastroView) editoraCadastroView.classList.remove('hidden');
		return;
	}
	if (hash.startsWith('#/livro/consulta')) {
		if (livroConsultaTab) livroConsultaTab.classList.add('active');
		if (livroConsultaView) {
			livroConsultaView.classList.remove('hidden');
			renderTabelaLivros();
		}
		return;
	}
	if (hash.startsWith('#/livro/cadastro')) {
		if (livroCadastroTab) livroCadastroTab.classList.add('active');
		if (livroCadastroView) livroCadastroView.classList.remove('hidden');
		return;
	}
	if (hash.startsWith('#/emprestimo/consulta')) {
		if (emprestimoConsultaTab) emprestimoConsultaTab.classList.add('active');
		if (emprestimoConsultaView) {
			emprestimoConsultaView.classList.remove('hidden');
			renderTabelaEmprestimos();
		}
		return;
	}
	if (hash.startsWith('#/emprestimo/cadastro')) {
		if (emprestimoCadastroTab) emprestimoCadastroTab.classList.add('active');
		if (emprestimoCadastroView) {
			emprestimoCadastroView.classList.remove('hidden');
			refreshEmprestimoCadastroSelects();
			resetEmprestimoCadastroDefaults(true);
		}
		return;
	}
	if (hash.startsWith('#/reserva/consulta')) {
		if (reservaConsultaTab) reservaConsultaTab.classList.add('active');
		if (reservaConsultaView) {
			reservaConsultaView.classList.remove('hidden');
			renderTabelaReservas();
		}
		return;
	}
	if (hash.startsWith('#/reserva/cadastro')) {
		if (reservaCadastroTab) reservaCadastroTab.classList.add('active');
		if (reservaCadastroView) {
			reservaCadastroView.classList.remove('hidden');
			refreshReservaCadastroSelects();
			resetReservaCadastroDefaults(true);
		}
		return;
	}
	if (hash.startsWith('#/relatorios-faixa-etaria')) {
		if (relatoriosFaixaEtariaTab) relatoriosFaixaEtariaTab.classList.add('active');
		if (relatoriosFaixaEtariaView) {
			relatoriosFaixaEtariaView.classList.remove('hidden');
			renderRelatorioFaixaEtariaHistory();
		}
		return;
	}
	if (hash.startsWith('#/relatorios')) {
		if (relatoriosTab) relatoriosTab.classList.add('active');
		if (relatoriosView) {
			relatoriosView.classList.remove('hidden');
			renderRelatorioGenerosHistory();
		}
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
	enforceInputPattern(nome, INPUT_PATTERNS.lettersOnly);
	matricula.addEventListener('input', () => {
		const raw = matricula.value;
		const cleaned = raw.replace(/\D+/g, '');
		if (raw !== cleaned) matricula.value = cleaned;
	});
	telefone.addEventListener('input', () => applyPhoneMask(telefone));
	telefone.addEventListener('blur', () => applyPhoneMask(telefone));
	email.addEventListener('input', () => {
		// Restringe para apenas letras na parte local do email (antes do @)
		const raw = email.value;
		const atIndex = raw.indexOf('@');
		if (atIndex === -1) {
			// Se ainda não tem @, permite apenas letras
			const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}]/gu, '');
			if (raw !== cleaned) email.value = cleaned;
		} else {
			// Se já tem @, mantém a parte local apenas com letras e preserva @atlas.com.br
			const localPart = raw.slice(0, atIndex);
			const domainPart = raw.slice(atIndex);
			const cleanedLocal = localPart.normalize('NFC').replace(/[^\p{L}\p{M}]/gu, '');
			if (localPart !== cleanedLocal) {
				email.value = cleanedLocal + domainPart;
			}
		}
	});

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
		const nascAno = Number(vNascimento.slice(0, 4));
		if (nascAno > 2025) {
			showMessage(messages, 'Ano de nascimento deve ser menor ou igual a 2025.', 'error');
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
			dataNascimento: vNascimento,
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
	const pendenciasFiltro = document.getElementById('filtroPendencias')?.value || '';
	let pendenciasSet = null;
	if (pendenciasFiltro) {
		const emprestimos = refreshEmprestimoAutomaticStatuses();
		pendenciasSet = new Set(
			emprestimos
				.filter(e => isRegistroAtivo(e) && ['Ativo', 'Atrasado', 'Perdido'].includes(e.status))
				.map(e => e.alunoId)
		);
	}

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
	if (pendenciasFiltro) {
		resultado = resultado.filter((aluno) => {
			const temPendencia = pendenciasSet?.has(aluno.id);
			return pendenciasFiltro === 'com' ? temPendencia : !temPendencia;
		});
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
	const filtroNome = document.getElementById('filtroNome');
	enforceNumericInput(document.getElementById('filtroMatricula'), 4);
	
	// Restringe campo Nome para apenas letras
	enforceInputPattern(filtroNome, INPUT_PATTERNS.lettersOnly);

	formFiltro.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabela();
	});

	btnLimpar.addEventListener('click', () => {
		document.getElementById('filtroNome').value = '';
		document.getElementById('filtroMatricula').value = '';
		document.getElementById('filtroStatus').value = '';
		const pendenciasSelect = document.getElementById('filtroPendencias');
		if (pendenciasSelect) pendenciasSelect.value = '';
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
	enforceInputPattern(nome, INPUT_PATTERNS.lettersAndNumbers);
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
		const previous = cloneRecord(alunos[idx]);
		// Campos proibidos de alteração: dataCadastro, matricula, email
		alunos[idx] = {
			...alunos[idx],
			nome: vNome,
			telefone: vTelefoneDigits,
			dataNascimento: vNascimento,
			status: vStatus
		};
		recordHistory('aluno', 'edit', alunos[idx], previous);
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
	if (alunoPossuiPendencias(aluno.id)) {
		alert('Não é possível excluir o aluno porque existem pendências de empréstimo (ativo, atrasado, perdido ou multa). Regularize as pendências e altere o status para Inativo antes de excluir.');
		return;
	}
	const ok = confirm(`Excluir o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	recordHistory('aluno', 'delete', aluno);
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

// ==== EDITORAS ====
function setupEditoraCadastro() {
	const form = document.getElementById('form-editora-cadastro');
	if (!form) return;
	const nome = document.getElementById('editoraNome');
	const telefone = document.getElementById('editoraTelefone');
	const endereco = document.getElementById('editoraEndereco');
	const messages = document.getElementById('editora-cadastro-messages');

	function validateEditoraForm() {
		const vNome = nome.value.trim();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vEndereco = endereco.value.trim();

		if (!vNome || !lettersAndNumbersRegex.test(vNome)) return false;
		if (!vTelefoneDigits || !digitsRegex.test(vTelefoneDigits) || vTelefoneDigits.length > 13) return false;
		if (vEndereco && !lettersAndNumbersRegex.test(vEndereco)) return false;

		return true;
	}

	enableEnterNavigation(form, validateEditoraForm);

	enforceInputPattern(nome, INPUT_PATTERNS.lettersAndNumbers);
	telefone.addEventListener('input', () => applyPhoneEditoraMask(telefone));
	telefone.addEventListener('blur', () => applyPhoneEditoraMask(telefone));
	enforceInputPattern(endereco, INPUT_PATTERNS.lettersNumbersPunct);

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showMessage(messages, '', 'success');

		const vNome = nome.value.trim();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vEndereco = endereco.value.trim();

		if (!vNome || !lettersAndNumbersRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras, números e espaços.', 'error');
			nome.focus();
			return;
		}
		if (vNome.length > 100) {
			showMessage(messages, 'Nome deve ter no máximo 100 caracteres.', 'error');
			nome.focus();
			return;
		}
		if (!vTelefoneDigits || !digitsRegex.test(vTelefoneDigits) || vTelefoneDigits.length !== 11) {
			showMessage(messages, 'Telefone de Contato é obrigatório e deve preencher todos os 11 dígitos (formato XXXX XXX XXXX).', 'error');
			telefone.focus();
			return;
		}
		if (vEndereco && !lettersAndNumbersRegex.test(vEndereco)) {
			showMessage(messages, 'Endereço Comercial deve conter apenas letras, números e caracteres permitidos.', 'error');
			endereco.focus();
			return;
		}
		if (vEndereco.length > 200) {
			showMessage(messages, 'Endereço Comercial deve ter no máximo 200 caracteres.', 'error');
			endereco.focus();
			return;
		}

		const editoras = loadEditoras();
		const novaEditora = {
			id: generateId(),
			nome: vNome,
			telefone: vTelefoneDigits,
			enderecoComercial: vEndereco,
			status: 'Ativa'
		};

		editoras.push(novaEditora);
		saveEditoras(editoras);
		form.reset();
		delete telefone.dataset.digits;
		showMessage(messages, 'Editora cadastrada com sucesso!', 'success');
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/editora/consulta';
		}, 300);
	});
}

function aplicarFiltrosEditoras(editoras) {
	const nome = document.getElementById('filtroEditoraNome')?.value.trim() || '';
	const status = document.getElementById('filtroEditoraStatus')?.value || '';

	let resultado = editoras;

	if (nome) {
		const n = nome.toLocaleLowerCase();
		resultado = resultado.filter(e => e.nome.toLocaleLowerCase().includes(n));
	}
	if (status) {
		resultado = resultado.filter(e => e.status === status);
	}

	resultado.sort((a, b) => collator.compare(a.nome, b.nome));
	return resultado;
}

function renderTabelaEditoras() {
	const tbody = document.getElementById('tbody-editoras');
	if (!tbody) return;
	const editoras = loadEditoras();
	const filtradas = aplicarFiltrosEditoras(editoras);

	if (!filtradas.length) {
		tbody.innerHTML = '<tr><td colspan="5" class="empty">Nenhuma editora encontrada.</td></tr>';
		return;
	}

	tbody.innerHTML = '';
	for (const e of filtradas) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(e.nome)}</td>
			<td>${escapeHtml(formatPhoneEditora(e.telefone))}</td>
			<td>${escapeHtml(e.enderecoComercial || '')}</td>
			<td>${escapeHtml(e.status)}</td>
			<td>
				<div class="actions">
					<button class="btn" data-action="editar-editora" data-id="${e.id}">Editar</button>
					<button class="btn danger" data-action="excluir-editora" data-id="${e.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupEditoraConsulta() {
	const formFiltro = document.getElementById('form-editora-filtro');
	const btnLimpar = document.getElementById('btnEditoraLimparFiltros');
	const tbody = document.getElementById('tbody-editoras');
	if (!formFiltro) return;

	formFiltro.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabelaEditoras();
	});
	btnLimpar?.addEventListener('click', () => {
		document.getElementById('filtroEditoraNome').value = '';
		document.getElementById('filtroEditoraStatus').value = '';
		renderTabelaEditoras();
	});
	tbody?.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar-editora') abrirModalEditoraEdicao(id);
		if (action === 'excluir-editora') excluirEditora(id);
	});
}

function abrirModalEditoraEdicao(id) {
	const editoras = loadEditoras();
	const editora = editoras.find(e => e.id === id);
	if (!editora) return;
	document.getElementById('edit-editora-id').value = editora.id;
	document.getElementById('edit-editora-nome').value = editora.nome;
	const telefoneInput = document.getElementById('edit-editora-telefone');
	telefoneInput.value = formatPhoneEditora(editora.telefone || '');
	applyPhoneEditoraMask(telefoneInput);
	document.getElementById('edit-editora-endereco').value = editora.enderecoComercial || '';
	document.getElementById('edit-editora-status').value = editora.status;
	showMessage(document.getElementById('editora-edicao-messages'), '', 'success');
	toggleEditoraModal(true);
}

function setupEditoraModalEdicao() {
	const overlay = document.getElementById('modal-editora-overlay');
	const form = document.getElementById('form-editora-edicao');
	const btnCancelar = document.getElementById('btnCancelarEditoraEdicao');
	if (!form) return;

	const nome = document.getElementById('edit-editora-nome');
	const telefone = document.getElementById('edit-editora-telefone');
	const endereco = document.getElementById('edit-editora-endereco');
	const status = document.getElementById('edit-editora-status');
	const messages = document.getElementById('editora-edicao-messages');

	overlay?.addEventListener('click', (e) => {
		if (e.target === overlay) toggleEditoraModal(false);
	});
	btnCancelar?.addEventListener('click', () => toggleEditoraModal(false));

	enforceInputPattern(nome, INPUT_PATTERNS.lettersAndNumbers);
	telefone?.addEventListener('input', () => applyPhoneEditoraMask(telefone));
	telefone?.addEventListener('blur', () => applyPhoneEditoraMask(telefone));
	enforceInputPattern(endereco, INPUT_PATTERNS.lettersNumbersPunct);

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const vNome = nome.value.trim();
		const vTelefoneDigits = telefone.value.replace(/\D+/g, '');
		const vEndereco = endereco.value.trim();
		const vStatus = status.value;
		const id = document.getElementById('edit-editora-id').value;

		if (!vNome || !lettersAndNumbersRegex.test(vNome)) {
			showMessage(messages, 'Nome é obrigatório e deve conter apenas letras, números e espaços.', 'error');
			nome.focus();
			return;
		}
		if (vNome.length > 100) {
			showMessage(messages, 'Nome deve ter no máximo 100 caracteres.', 'error');
			nome.focus();
			return;
		}
		if (!vTelefoneDigits || !digitsRegex.test(vTelefoneDigits) || vTelefoneDigits.length !== 11) {
			showMessage(messages, 'Telefone de Contato é obrigatório e deve preencher todos os 11 dígitos (formato XXXX XXX XXXX).', 'error');
			telefone.focus();
			return;
		}
		if (vEndereco && !lettersAndNumbersRegex.test(vEndereco)) {
			showMessage(messages, 'Endereço Comercial deve conter apenas letras, números e caracteres permitidos.', 'error');
			endereco.focus();
			return;
		}
		if (vEndereco.length > 200) {
			showMessage(messages, 'Endereço Comercial deve ter no máximo 200 caracteres.', 'error');
			endereco.focus();
			return;
		}
		if (!vStatus || !allowedEditoraStatuses.has(vStatus)) {
			showMessage(messages, 'Status é obrigatório e deve ser Ativa ou Inativa.', 'error');
			status.focus();
			return;
		}

		const editoras = loadEditoras();
		const idx = editoras.findIndex(e => e.id === id);
		if (idx < 0) {
			showMessage(messages, 'Editora não encontrada.', 'error');
			return;
		}
		const previous = cloneRecord(editoras[idx]);
		editoras[idx] = {
			...editoras[idx],
			nome: vNome,
			telefone: vTelefoneDigits,
			enderecoComercial: vEndereco,
			status: vStatus
		};
		recordHistory('editora', 'edit', editoras[idx], previous);
		saveEditoras(editoras);
		showMessage(messages, 'Editora atualizada com sucesso!', 'success');
		setTimeout(() => {
			toggleEditoraModal(false);
			renderTabelaEditoras();
		}, 300);
	});
}

function toggleEditoraModal(show) {
	const overlay = document.getElementById('modal-editora-overlay');
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirEditora(id) {
	const editoras = loadEditoras();
	const editora = editoras.find(e => e.id === id);
	if (!editora) return;
	const livrosVinculados = loadLivros().filter(l => (l.editoraIds || []).includes(id));
	if (livrosVinculados.length) {
		const lista = livrosVinculados.map(l => `- ${l.titulo}`).join('\n');
		alert(`Não é possível excluir a editora "${editora.nome}" porque ela está associada aos seguintes livros:\n${lista}\n\nRemova a associação dos livros antes de excluir.`);
		return;
	}
	const ok = confirm(`Excluir a editora "${editora.nome}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	recordHistory('editora', 'delete', editora);
	const restantes = editoras.filter(e => e.id !== id);
	saveEditoras(restantes);
	renderTabelaEditoras();
	updateHomeStats();
}

// ==== LIVROS ====
function setupLivroCadastro() {
	const form = document.getElementById('form-livro-cadastro');
	if (!form) return;
	const titulo = document.getElementById('livroTitulo');
	const autoresSelect = document.getElementById('livroAutores');
	const isbn = document.getElementById('livroIsbn');
	const generosSelect = document.getElementById('livroGeneros');
	const exemplares = document.getElementById('livroExemplares');
	const editorasSelect = document.getElementById('livroEditoras');
	const ano = document.getElementById('livroAno');
	const localizacao = document.getElementById('livroLocalizacao');
	const messages = document.getElementById('livro-cadastro-messages');

	populateGenreSelect(generosSelect);
	initSelectedChips('livroAutores', 'livroAutoresChips');
	initSelectedChips('livroGeneros', 'livroGenerosChips');
	initSelectedChips('livroEditoras', 'livroEditorasChips');
	enforceNumericInput(exemplares, 4);
	enforceNumericInput(ano, 4);

	enforceInputPattern(titulo, INPUT_PATTERNS.lettersAndNumbers);
	isbn.addEventListener('input', () => applyIsbnMask(isbn));
	isbn.addEventListener('blur', () => applyIsbnMask(isbn));
	enforceInputPattern(localizacao, INPUT_PATTERNS.lettersNumbersPunct);
	ano.addEventListener('input', () => {
		const raw = ano.value;
		const cleaned = raw.replace(/\D+/g, '').slice(0, 4);
		if (raw !== cleaned) ano.value = cleaned;
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showMessage(messages, '', 'success');

		const vTitulo = titulo.value.trim();
		const autorIds = getSelectedValues(autoresSelect);
		const vIsbn = formatIsbn(isbn.value);
		const generos = getSelectedValues(generosSelect);
		const vExemplares = exemplares.value.trim();
		const editoraIds = getSelectedValues(editorasSelect);
		const vAno = ano.value.trim();
		const vLocal = localizacao.value.trim();

		if (!vTitulo || !titleRegex.test(vTitulo)) {
			showMessage(messages, 'Título é obrigatório e deve conter apenas letras, números e espaços.', 'error');
			titulo.focus();
			return;
		}
		if (vTitulo.length > 100) {
			showMessage(messages, 'Título deve ter no máximo 100 caracteres.', 'error');
			titulo.focus();
			return;
		}
		if (!autorIds.length) {
			showMessage(messages, 'Selecione pelo menos um autor.', 'error');
			autoresSelect.focus();
			return;
		}
		if (!vIsbn || !isbnRegex.test(vIsbn)) {
			showMessage(messages, 'ISBN é obrigatório e deve seguir o formato XXX-XX-XXXX-XXX-X.', 'error');
			isbn.focus();
			return;
		}
		if (!generos.length) {
			showMessage(messages, 'Selecione pelo menos um gênero.', 'error');
			generosSelect.focus();
			return;
		}
		if (!vExemplares || !digitsRegex.test(vExemplares)) {
			showMessage(messages, 'Exemplares é obrigatório e deve conter apenas números.', 'error');
			exemplares.focus();
			return;
		}
		const exemplaresNumber = Number(vExemplares);
		if (!Number.isInteger(exemplaresNumber) || exemplaresNumber < 1) {
			showMessage(messages, 'Informe um número válido de exemplares (mínimo 1).', 'error');
			exemplares.focus();
			return;
		}
		if (vAno) {
			if (!yearRegex.test(vAno)) {
				showMessage(messages, 'Ano de publicação deve conter 4 dígitos.', 'error');
				ano.focus();
				return;
			}
			if (Number(vAno) > 2025) {
				showMessage(messages, 'Ano de publicação deve ser menor ou igual a 2025.', 'error');
				ano.focus();
				return;
			}
		}
		if (vLocal && !lettersAndNumbersRegex.test(vLocal)) {
			showMessage(messages, 'Localização física deve conter apenas caracteres permitidos.', 'error');
			localizacao.focus();
			return;
		}

		const livros = loadLivros();
		if (livros.some(l => l.isbn === vIsbn)) {
			showMessage(messages, 'Já existe um livro cadastrado com este ISBN.', 'error');
			isbn.focus();
			return;
		}

		const novoLivro = {
			id: generateId(),
			titulo: vTitulo,
			autorIds,
			isbn: vIsbn,
			generos,
			exemplares: exemplaresNumber,
			editoraIds,
			anoPublicacao: vAno,
			localizacao: vLocal
		};
		livros.push(novoLivro);
		saveLivros(livros);
		form.reset();
		refreshSelectChips(autoresSelect);
		refreshSelectChips(generosSelect);
		refreshSelectChips(editorasSelect);
		showMessage(messages, 'Livro cadastrado com sucesso!', 'success');
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/livro/consulta';
		}, 300);
	});
}

function aplicarFiltrosLivros(livros, autoresMap) {
	const titulo = document.getElementById('filtroLivroTitulo')?.value.trim().toLocaleLowerCase() || '';
	const autor = document.getElementById('filtroLivroAutor')?.value.trim().toLocaleLowerCase() || '';
	const isbnInput = document.getElementById('filtroLivroIsbn')?.value.trim() || '';
	const isbn = isbnInput ? formatIsbn(isbnInput) : '';
	const genero = document.getElementById('filtroLivroGenero')?.value || '';
	let resultado = livros;
	if (titulo) {
		resultado = resultado.filter(l => l.titulo.toLocaleLowerCase().includes(titulo));
	}
	if (autor) {
		resultado = resultado.filter(l =>
			(l.autorIds || []).some(id => (autoresMap.get(id) || '').toLocaleLowerCase().includes(autor))
		);
	}
	if (isbn) {
		resultado = resultado.filter(l => l.isbn === isbn);
	}
	if (genero) {
		resultado = resultado.filter(l => (l.generos || []).includes(genero));
	}
	resultado.sort((a, b) => collator.compare(a.titulo, b.titulo));
	return resultado;
}

function renderTabelaLivros() {
	const tbody = document.getElementById('tbody-livros');
	if (!tbody) return;
	const livros = loadLivros();
	const autoresMap = new Map(loadAutores().map(a => [a.id, a.nome]));
	const editorasMap = new Map(loadEditoras().map(e => [e.id, e.nome]));
	const filtrados = aplicarFiltrosLivros(livros, autoresMap);

	if (!filtrados.length) {
		tbody.innerHTML = '<tr><td colspan="9" class="empty">Nenhum livro encontrado.</td></tr>';
		return;
	}

	tbody.innerHTML = '';
	for (const livro of filtrados) {
		const autoresNomes = (livro.autorIds || []).map(id => autoresMap.get(id) || 'Autor removido').join(', ');
		const editorasNomes = (livro.editoraIds || []).map(id => editorasMap.get(id) || 'Editora removida').join(', ');
		const generosTexto = (livro.generos || []).join(', ');
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(livro.titulo)}</td>
			<td>${escapeHtml(autoresNomes)}</td>
			<td>${escapeHtml(livro.isbn)}</td>
			<td>${escapeHtml(generosTexto)}</td>
			<td>${escapeHtml(String(livro.exemplares))}</td>
			<td>${escapeHtml(editorasNomes)}</td>
			<td>${escapeHtml(livro.anoPublicacao || '')}</td>
			<td>${escapeHtml(livro.localizacao || '')}</td>
			<td>
				<div class="actions">
					<button class="btn" data-action="editar-livro" data-id="${livro.id}">Editar</button>
					<button class="btn danger" data-action="excluir-livro" data-id="${livro.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupLivroConsulta() {
	const formFiltro = document.getElementById('form-livro-filtro');
	const btnLimpar = document.getElementById('btnLivroLimparFiltros');
	const generoFiltro = document.getElementById('filtroLivroGenero');
	const filtroIsbn = document.getElementById('filtroLivroIsbn');
	const tbody = document.getElementById('tbody-livros');
	if (!formFiltro) return;

	populateGenreSelect(generoFiltro, true);
	filtroIsbn?.addEventListener('input', () => applyIsbnMask(filtroIsbn));
	
	// Restringe campo Autor para apenas letras
	const filtroLivroAutor = document.getElementById('filtroLivroAutor');
	enforceInputPattern(filtroLivroAutor, INPUT_PATTERNS.lettersOnly);

	formFiltro.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabelaLivros();
	});
	btnLimpar?.addEventListener('click', () => {
		document.getElementById('filtroLivroTitulo').value = '';
		document.getElementById('filtroLivroAutor').value = '';
		document.getElementById('filtroLivroIsbn').value = '';
		document.getElementById('filtroLivroGenero').value = '';
		renderTabelaLivros();
	});
	tbody?.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar-livro') abrirModalLivroEdicao(id);
		if (action === 'excluir-livro') excluirLivro(id);
	});
}

function abrirModalLivroEdicao(id) {
	const livros = loadLivros();
	const livro = livros.find(l => l.id === id);
	if (!livro) return;
	refreshLivroRelatedSelects();
	populateGenreSelect(document.getElementById('edit-livro-generos'));
	document.getElementById('edit-livro-id').value = livro.id;
	document.getElementById('edit-livro-titulo').value = livro.titulo;
	setSelectValues(document.getElementById('edit-livro-autores'), livro.autorIds || []);
	const isbnInput = document.getElementById('edit-livro-isbn');
	isbnInput.value = livro.isbn;
	setSelectValues(document.getElementById('edit-livro-generos'), livro.generos || []);
	document.getElementById('edit-livro-exemplares').value = livro.exemplares;
	setSelectValues(document.getElementById('edit-livro-editoras'), livro.editoraIds || []);
	document.getElementById('edit-livro-ano').value = livro.anoPublicacao || '';
	document.getElementById('edit-livro-localizacao').value = livro.localizacao || '';
	showMessage(document.getElementById('livro-edicao-messages'), '', 'success');
	toggleLivroModal(true);
}

function setupLivroModalEdicao() {
	const overlay = document.getElementById('modal-livro-overlay');
	const form = document.getElementById('form-livro-edicao');
	const btnCancelar = document.getElementById('btnCancelarLivroEdicao');
	if (!form) return;

	const titulo = document.getElementById('edit-livro-titulo');
	const autoresSelect = document.getElementById('edit-livro-autores');
	const isbn = document.getElementById('edit-livro-isbn');
	const generosSelect = document.getElementById('edit-livro-generos');
	const exemplares = document.getElementById('edit-livro-exemplares');
	const editorasSelect = document.getElementById('edit-livro-editoras');
	const ano = document.getElementById('edit-livro-ano');
	const localizacao = document.getElementById('edit-livro-localizacao');
	const messages = document.getElementById('livro-edicao-messages');

	populateGenreSelect(generosSelect);
	initSelectedChips('edit-livro-autores', 'editLivroAutoresChips');
	initSelectedChips('edit-livro-generos', 'editLivroGenerosChips');
	initSelectedChips('edit-livro-editoras', 'editLivroEditorasChips');
	enforceNumericInput(exemplares, 4);
	enforceNumericInput(ano, 4);

	overlay?.addEventListener('click', (e) => {
		if (e.target === overlay) toggleLivroModal(false);
	});
	btnCancelar?.addEventListener('click', () => toggleLivroModal(false));

	enforceInputPattern(titulo, INPUT_PATTERNS.lettersAndNumbers);
	isbn.addEventListener('input', () => applyIsbnMask(isbn));
	isbn.addEventListener('blur', () => applyIsbnMask(isbn));
	enforceInputPattern(localizacao, INPUT_PATTERNS.lettersNumbersPunct);
	ano.addEventListener('input', () => {
		const raw = ano.value;
		const cleaned = raw.replace(/\D+/g, '').slice(0, 4);
		if (raw !== cleaned) ano.value = cleaned;
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const vTitulo = titulo.value.trim();
		const autorIds = getSelectedValues(autoresSelect);
		const vIsbn = formatIsbn(isbn.value);
		const generos = getSelectedValues(generosSelect);
		const vExemplares = exemplares.value.trim();
		const editoraIds = getSelectedValues(editorasSelect);
		const vAno = ano.value.trim();
		const vLocal = localizacao.value.trim();
		const id = document.getElementById('edit-livro-id').value;

		if (!vTitulo || !titleRegex.test(vTitulo)) {
			showMessage(messages, 'Título é obrigatório e deve conter apenas letras, números e espaços.', 'error');
			titulo.focus();
			return;
		}
		if (vTitulo.length > 100) {
			showMessage(messages, 'Título deve ter no máximo 100 caracteres.', 'error');
			titulo.focus();
			return;
		}
		if (!autorIds.length) {
			showMessage(messages, 'Selecione pelo menos um autor.', 'error');
			autoresSelect.focus();
			return;
		}
		if (!vIsbn || !isbnRegex.test(vIsbn)) {
			showMessage(messages, 'ISBN é obrigatório e deve seguir o formato XXX-XX-XXXX-XXX-X.', 'error');
			isbn.focus();
			return;
		}
		if (!generos.length) {
			showMessage(messages, 'Selecione pelo menos um gênero.', 'error');
			generosSelect.focus();
			return;
		}
		if (!vExemplares || !digitsRegex.test(vExemplares)) {
			showMessage(messages, 'Exemplares é obrigatório e deve conter apenas números.', 'error');
			exemplares.focus();
			return;
		}
		const exemplaresNumber = Number(vExemplares);
		if (!Number.isInteger(exemplaresNumber) || exemplaresNumber < 1) {
			showMessage(messages, 'Informe um número válido de exemplares (mínimo 1).', 'error');
			exemplares.focus();
			return;
		}
		if (vAno && !yearRegex.test(vAno)) {
			showMessage(messages, 'Ano de publicação deve conter 4 dígitos.', 'error');
			ano.focus();
			return;
		}
		if (vAno && Number(vAno) > 2025) {
			showMessage(messages, 'Ano de publicação deve ser menor ou igual a 2025.', 'error');
			ano.focus();
			return;
		}
		if (vLocal && !lettersAndNumbersRegex.test(vLocal)) {
			showMessage(messages, 'Localização física deve conter apenas caracteres permitidos.', 'error');
			localizacao.focus();
			return;
		}

		const livros = loadLivros();
		const idx = livros.findIndex(l => l.id === id);
		if (idx < 0) {
			showMessage(messages, 'Livro não encontrado.', 'error');
			return;
		}
		const previous = cloneRecord(livros[idx]);
		if (livros.some((l, index) => index !== idx && l.isbn === vIsbn)) {
			showMessage(messages, 'Já existe outro livro com este ISBN.', 'error');
			isbn.focus();
			return;
		}

		livros[idx] = {
			...livros[idx],
			titulo: vTitulo,
			autorIds,
			isbn: vIsbn,
			generos,
			exemplares: exemplaresNumber,
			editoraIds,
			anoPublicacao: vAno,
			localizacao: vLocal
		};
		recordHistory('livro', 'edit', livros[idx], previous);
		saveLivros(livros);
		showMessage(messages, 'Livro atualizado com sucesso!', 'success');
		setTimeout(() => {
			toggleLivroModal(false);
			renderTabelaLivros();
			updateHomeStats();
		}, 300);
	});
}

function toggleLivroModal(show) {
	const overlay = document.getElementById('modal-livro-overlay');
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirLivro(id) {
	const livros = loadLivros();
	const livro = livros.find(l => l.id === id);
	if (!livro) return;
	if (livroPossuiEmprestimosPendentes(livro.id)) {
		alert('Não é possível excluir este livro porque existem empréstimos em andamento (Ativo, Atrasado ou Perdido) associados a ele. Aguarde a regularização de todos os exemplares.');
		return;
	}
	const ok = confirm(`Excluir o livro "${livro.titulo}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	recordHistory('livro', 'delete', livro);
	const restantes = livros.filter(l => l.id !== id);
	saveLivros(restantes);
	renderTabelaLivros();
	updateHomeStats();
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
	refreshEmprestimoAutomaticStatuses();
	refreshReservaAutomaticStatuses();
	updateViewFromHash();
	setupCadastro();
	setupConsulta();
	setupModalEdicao();
	setupAutorCadastro();
	setupAutorConsulta();
	setupAutorModalEdicao();
	setupEditoraCadastro();
	setupEditoraConsulta();
	setupEditoraModalEdicao();
	refreshLivroRelatedSelects();
	setupLivroCadastro();
	setupLivroConsulta();
	setupLivroModalEdicao();
	refreshEmprestimoCadastroSelects();
	refreshReservaCadastroSelects();
	setupEmprestimoCadastro();
	setupEmprestimoConsulta();
	setupEmprestimoModalEdicao();
	setupReservaCadastro();
	setupReservaConsulta();
	setupReservaModalEdicao();
	setupRelatorioGeneros();
	setupRelatorioFaixaEtaria();
	setupHistoryUI();
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
		if (vBiografia && !lettersAndNumbersRegex.test(vBiografia)) return false;

		return true;
	}

	enableEnterNavigation(form, validateAutorForm);

	enforceInputPattern(nome, INPUT_PATTERNS.lettersOnly);
	enforceInputPattern(nacionalidade, INPUT_PATTERNS.lettersOnly);
	enforceInputPattern(biografia, INPUT_PATTERNS.lettersNumbersPunct);

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showMessage(messages, '', 'success');

		const vNome = nome.value.trim();
		const vNacionalidade = nacionalidade.value.trim();
		const vNascimento = nascimento.value; // opcional
		if (vNascimento) {
			const anoNascimento = Number(vNascimento.slice(0, 4));
			if (anoNascimento > 2025) {
				showMessage(messages, 'Ano de nascimento deve ser menor ou igual a 2025.', 'error');
				nascimento.focus();
				return;
			}
		}
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
		if (vBiografia && !lettersAndNumbersRegex.test(vBiografia)) {
			showMessage(messages, 'Biografia deve conter apenas letras, números e caracteres permitidos.', 'error');
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
	const filtroAutorNome = document.getElementById('filtroAutorNome');
	const filtroAutorNacionalidade = document.getElementById('filtroAutorNacionalidade');
	if (!formFiltro) return;
	
	// Restringe campo Nome para apenas letras
	enforceInputPattern(filtroAutorNome, INPUT_PATTERNS.lettersOnly);
	// Restringe campo Nacionalidade para apenas letras
	enforceInputPattern(filtroAutorNacionalidade, INPUT_PATTERNS.lettersOnly);

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

	enforceInputPattern(nome, INPUT_PATTERNS.lettersOnly);
	enforceInputPattern(nacionalidade, INPUT_PATTERNS.lettersOnly);
	enforceInputPattern(biografia, INPUT_PATTERNS.lettersNumbersPunct);

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const vNome = nome.value.trim();
		const vNacionalidade = nacionalidade.value.trim();
		const vNascimento = nascimento.value;
		if (vNascimento) {
			const anoNascimento = Number(vNascimento.slice(0, 4));
			if (anoNascimento > 2025) {
				showMessage(messages, 'Ano de nascimento deve ser menor ou igual a 2025.', 'error');
				nascimento.focus();
				return;
			}
		}
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
		if (vBiografia && !lettersAndNumbersRegex.test(vBiografia)) {
			showMessage(messages, 'Biografia deve conter apenas letras, números e caracteres permitidos.', 'error');
			biografia.focus();
			return;
		}

		const autores = loadAutores();
		const idx = autores.findIndex(a => a.id === id);
		if (idx < 0) {
			showMessage(messages, 'Autor não encontrado.', 'error');
			return;
		}
		const previous = cloneRecord(autores[idx]);
		autores[idx] = {
			...autores[idx],
			nome: vNome,
			nacionalidade: vNacionalidade,
			dataNascimento: vNascimento || '',
			biografia: vBiografia
		};
		recordHistory('autor', 'edit', autores[idx], previous);
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
	const livrosAssociados = loadLivros().filter(l => (l.autorIds || []).includes(id));
	if (livrosAssociados.length) {
		const lista = livrosAssociados.map(l => `- ${l.titulo}`).join('\n');
		alert(`Não é possível excluir o autor "${autor.nome}" pois ele está associado aos seguintes livros:\n${lista}\n\nDesvincule o autor dos livros antes de excluí-lo.`);
		return;
	}
	const ok = confirm(`Excluir o autor "${autor.nome}"? Esta ação não pode ser desfeita.`);
	if (!ok) return;
	recordHistory('autor', 'delete', autor);
	const restantes = autores.filter(a => a.id !== id);
	saveAutores(restantes);
	renderTabelaAutores();
	updateHomeStats();
}

// ==== EMPRESTIMOS ====
function validarAlunoParaEmprestimo(alunoId) {
	if (!alunoId) return 'Selecione um aluno.';
	const aluno = findAlunoById(alunoId);
	if (!aluno) return 'Aluno não encontrado.';
	if (aluno.status !== 'Ativo') return 'Somente alunos com status Ativo podem realizar empréstimos.';
	if (aluno.status === 'Suspenso') return 'Alunos suspensos não podem realizar empréstimos.';
	if (alunoPossuiEmprestimoAtrasado(alunoId)) return 'O aluno possui empréstimos atrasados.';
	if (countEmprestimosAtivosAluno(alunoId) >= MAX_EMPRESTIMOS_ATIVOS) {
		return `Limite de ${MAX_EMPRESTIMOS_ATIVOS} empréstimos ativos atingido para este aluno.`;
	}
	return '';
}

function validarLivroParaEmprestimo(livroId, alunoId) {
	if (!livroId) return 'Selecione um livro.';
	const livro = findLivroById(livroId);
	if (!livro) return 'Livro não encontrado.';
	const disponiveis = livroCopiasDisponiveis(livroId);
	if (disponiveis <= 0) return 'Não há exemplares disponíveis para empréstimo.';
	const reservaInfo = existeReservaAtivaParaLivro(livroId, alunoId);
	if (reservaInfo.reservadaPorOutro) return 'O livro está reservado para outro aluno.';
	return '';
}

function setupEmprestimoCadastro() {
	const form = document.getElementById('form-emprestimo-cadastro');
	if (!form) return;
	const alunoSelect = document.getElementById('emprestimoAluno');
	const livroSelect = document.getElementById('emprestimoLivro');
	const dataEmprestimoInput = document.getElementById('emprestimoData');
	const dataPrevistaInput = document.getElementById('emprestimoDataPrevista');
	const statusSelect = document.getElementById('emprestimoStatus');
	const messages = document.getElementById('emprestimo-cadastro-messages');

	refreshEmprestimoCadastroSelects();
	resetEmprestimoCadastroDefaults(true);
	showMessage(messages, '', 'success');

	alunoSelect?.addEventListener('change', () => {
		const error = validarAlunoParaEmprestimo(alunoSelect.value);
		if (error) showMessage(messages, error, 'error'); else showMessage(messages, '', 'success');
	});
	livroSelect?.addEventListener('change', () => {
		const alunoId = alunoSelect.value;
		if (!alunoId) return;
		const error = validarLivroParaEmprestimo(livroSelect.value, alunoId);
		if (error) showMessage(messages, error, 'error'); else showMessage(messages, '', 'success');
	});

	form.addEventListener('reset', () => {
		setTimeout(() => {
			refreshEmprestimoCadastroSelects();
			resetEmprestimoCadastroDefaults(true);
			showMessage(messages, '', 'success');
		}, 0);
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const alunoId = alunoSelect.value;
		const livroId = livroSelect.value;
		const dataPrevista = dataPrevistaInput.value;
		const status = statusSelect.value || 'Ativo';

		if (!dataPrevista) {
			showMessage(messages, 'Informe a data de devolução prevista.', 'error');
			dataPrevistaInput.focus();
			return;
		}
		const alunoError = validarAlunoParaEmprestimo(alunoId);
		if (alunoError) {
			showMessage(messages, alunoError, 'error');
			alunoSelect.focus();
			return;
		}
		const livroError = validarLivroParaEmprestimo(livroId, alunoId);
		if (livroError) {
			showMessage(messages, livroError, 'error');
			livroSelect.focus();
			return;
		}
		if (!EMPRESTIMO_STATUS.includes(status)) {
			showMessage(messages, 'Selecione um status de empréstimo válido.', 'error');
			statusSelect.focus();
			return;
		}
		const hoje = getTodayDateInputValue();
		// Validar que status 'Atrasado' só pode ser usado se a data prevista for ultrapassada
		if (status === 'Atrasado' && dataPrevista >= hoje) {
			showMessage(messages, 'O status "Atrasado" só pode ser usado quando a data de devolução prevista for ultrapassada.', 'error');
			statusSelect.focus();
			return;
		}
		// Para outros status, a data prevista não pode ser anterior à data atual
		if (status !== 'Atrasado' && dataPrevista < hoje) {
			showMessage(messages, 'A data prevista não pode ser anterior à data atual.', 'error');
			dataPrevistaInput.focus();
			return;
		}
		const emprestimos = refreshEmprestimoAutomaticStatuses();
		const novoEmprestimo = {
			id: generateId(),
			alunoId,
			livroId,
			status,
			dataEmprestimo: dataEmprestimoInput.dataset.iso || nowIsoString(),
			dataDevolucaoPrevista: dataPrevista,
			dataDevolucaoReal: status === 'Devolvido' ? nowIsoString() : '',
			ativo: true,
			criadoEm: nowIsoString()
		};
		emprestimos.push(novoEmprestimo);
		saveEmprestimos(emprestimos);
		concluirReservaRelacionada(alunoId, livroId);
		showMessage(messages, 'Empréstimo registrado com sucesso!', 'success');
		form.reset();
		refreshEmprestimoCadastroSelects();
		resetEmprestimoCadastroDefaults(true);
		showMessage(messages, '', 'success');
		renderTabelaEmprestimos();
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/emprestimo/consulta';
		}, 300);
	});
}

function concluirReservaRelacionada(alunoId, livroId) {
	if (!alunoId || !livroId) return;
	const reservas = refreshReservaAutomaticStatuses();
	const idx = reservas.findIndex(r =>
		isRegistroAtivo(r) &&
		r.alunoId === alunoId &&
		r.livroId === livroId &&
		r.status === 'Ativa'
	);
	if (idx === -1) return;
	const previous = cloneRecord(reservas[idx]);
	reservas[idx] = {
		...reservas[idx],
		status: 'Concluída',
		dataConclusao: nowIsoString()
	};
	recordHistory('reserva', 'edit', reservas[idx], previous);
	saveReservas(reservas);
}

function aplicarFiltrosEmprestimos(emprestimos, alunosMap, livrosMap, autoresMap) {
	const alunoTerm = document.getElementById('filtroEmprestimoAluno')?.value.trim().toLocaleLowerCase() || '';
	const livroTerm = document.getElementById('filtroEmprestimoLivro')?.value.trim().toLocaleLowerCase() || '';
	const statusFilter = document.getElementById('filtroEmprestimoStatus')?.value || '';
	const dataPrevista = document.getElementById('filtroEmprestimoDataPrevista')?.value || '';
	const apenasAtrasados = document.getElementById('filtroEmprestimoAtrasado')?.checked || false;

	return emprestimos.filter((emprestimo) => {
		const aluno = alunosMap.get(emprestimo.alunoId);
		const livro = livrosMap.get(emprestimo.livroId);
		if (alunoTerm) {
			const nomeMatch = aluno?.nome?.toLocaleLowerCase().includes(alunoTerm);
			const matriculaMatch = aluno?.matricula?.toLocaleLowerCase().includes(alunoTerm);
			if (!nomeMatch && !matriculaMatch) return false;
		}
		if (livroTerm) {
			const tituloMatch = livro?.titulo?.toLocaleLowerCase().includes(livroTerm);
			const isbnMatch = livro?.isbn?.toLocaleLowerCase().includes(livroTerm);
			const autorMatch = (livro?.autorIds || []).some(id =>
				(autoresMap.get(id) || '').toLocaleLowerCase().includes(livroTerm)
			);
			if (!tituloMatch && !isbnMatch && !autorMatch) return false;
		}
		if (statusFilter && emprestimo.status !== statusFilter) return false;
		if (dataPrevista && emprestimo.dataDevolucaoPrevista !== dataPrevista) return false;
		if (apenasAtrasados && emprestimo.status !== 'Atrasado') return false;
		return true;
	});
}

function renderTabelaEmprestimos() {
	const tbody = document.getElementById('tbody-emprestimos');
	if (!tbody) return;
	const emprestimos = refreshEmprestimoAutomaticStatuses().filter(isRegistroAtivo);
	const alunosMap = new Map(loadAlunos().map(a => [a.id, a]));
	const livrosMap = new Map(loadLivros().map(l => [l.id, l]));
	const autoresMap = new Map(loadAutores().map(a => [a.id, a.nome]));
	const filtrados = aplicarFiltrosEmprestimos(emprestimos, alunosMap, livrosMap, autoresMap)
		.sort((a, b) => new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo));

	if (!filtrados.length) {
		tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhum empréstimo encontrado.</td></tr>';
		return;
	}

	tbody.innerHTML = '';
	for (const emprestimo of filtrados) {
		const aluno = alunosMap.get(emprestimo.alunoId);
		const livro = livrosMap.get(emprestimo.livroId);
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(formatAlunoLabel(aluno))}</td>
			<td>${escapeHtml(formatLivroLabel(livro))}</td>
			<td>${escapeHtml(formatDateTimeDisplay(emprestimo.dataEmprestimo))}</td>
			<td>${escapeHtml(formatDateToDisplay(emprestimo.dataDevolucaoPrevista))}</td>
			<td>${escapeHtml(emprestimo.status)}</td>
			<td>
				<div class="actions">
					<button id="edit-emprestimo" class="btn" data-action="editar-emprestimo" data-id="${emprestimo.id}">Editar</button>
					<button class="btn danger" data-action="excluir-emprestimo" data-id="${emprestimo.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupEmprestimoConsulta() {
	const form = document.getElementById('form-emprestimo-filtro');
	const btnLimpar = document.getElementById('btnEmprestimoLimparFiltros');
	const tbody = document.getElementById('tbody-emprestimos');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabelaEmprestimos();
	});
	btnLimpar?.addEventListener('click', () => {
		document.getElementById('filtroEmprestimoAluno').value = '';
		document.getElementById('filtroEmprestimoLivro').value = '';
		document.getElementById('filtroEmprestimoStatus').value = '';
		document.getElementById('filtroEmprestimoDataPrevista').value = '';
		document.getElementById('filtroEmprestimoAtrasado').checked = false;
		renderTabelaEmprestimos();
	});
	tbody?.addEventListener('click', (e) => {
		const btn = e.target.closest('button[data-action]');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar-emprestimo') abrirModalEmprestimoEdicao(id);
		if (action === 'excluir-emprestimo') excluirEmprestimo(id);
	});
}

function abrirModalEmprestimoEdicao(id) {
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const emprestimo = emprestimos.find(e => e.id === id);
	if (!emprestimo || emprestimo.ativo === false) return;
	document.getElementById('edit-emprestimo-id').value = emprestimo.id;
	document.getElementById('edit-emprestimo-aluno').value = formatAlunoLabel(findAlunoById(emprestimo.alunoId));
	document.getElementById('edit-emprestimo-livro').value = formatLivroLabel(findLivroById(emprestimo.livroId));
	document.getElementById('edit-emprestimo-data').value = formatDateTimeDisplay(emprestimo.dataEmprestimo);
	document.getElementById('edit-emprestimo-prevista').value = emprestimo.dataDevolucaoPrevista || getTodayDateInputValue();
	document.getElementById('edit-emprestimo-status').value = emprestimo.status;
	showMessage(document.getElementById('emprestimo-edicao-messages'), '', 'success');
	toggleEmprestimoModal(true);
}

function setupEmprestimoModalEdicao() {
	const overlay = document.getElementById('modal-emprestimo-overlay');
	const form = document.getElementById('form-emprestimo-edicao');
	const btnCancelar = document.getElementById('btnCancelarEmprestimoEdicao');
	if (!form) return;

	overlay?.addEventListener('click', (e) => {
		if (e.target === overlay) toggleEmprestimoModal(false);
	});
	btnCancelar?.addEventListener('click', () => toggleEmprestimoModal(false));

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const id = document.getElementById('edit-emprestimo-id').value;
		const dataPrevista = document.getElementById('edit-emprestimo-prevista').value;
		const status = document.getElementById('edit-emprestimo-status').value;
		const messages = document.getElementById('emprestimo-edicao-messages');
		if (!dataPrevista) {
			showMessage(messages, 'Informe a nova data de devolução prevista.', 'error');
			return;
		}
		if (!EMPRESTIMO_STATUS.includes(status)) {
			showMessage(messages, 'Selecione um status válido.', 'error');
			return;
		}
		const emprestimos = refreshEmprestimoAutomaticStatuses();
		const idx = emprestimos.findIndex(e => e.id === id);
		if (idx === -1) {
			showMessage(messages, 'Empréstimo não encontrado.', 'error');
			return;
		}
		const emprestimo = emprestimos[idx];
		const dataEmprestimo = emprestimo.dataEmprestimo?.slice(0, 10);
		if (dataEmprestimo && dataPrevista < dataEmprestimo) {
			showMessage(messages, 'A data prevista não pode ser anterior à data do empréstimo.', 'error');
			return;
		}
		// Validar que status 'Atrasado' só pode ser usado se a data prevista for ultrapassada
		const hoje = getTodayDateInputValue();
		if (status === 'Atrasado' && dataPrevista >= hoje) {
			showMessage(messages, 'O status "Atrasado" só pode ser usado quando a data de devolução prevista for ultrapassada.', 'error');
			return;
		}
		const previous = cloneRecord(emprestimo);
		emprestimo.dataDevolucaoPrevista = dataPrevista;
		emprestimo.status = status;
		if (status === 'Devolvido') {
			emprestimo.dataDevolucaoReal = nowIsoString();
		} else if (status !== 'Devolvido') {
			emprestimo.dataDevolucaoReal = '';
		}
		recordHistory('emprestimo', 'edit', emprestimo, previous);
		saveEmprestimos(emprestimos);
		showMessage(messages, 'Empréstimo atualizado com sucesso!', 'success');
		setTimeout(() => {
			toggleEmprestimoModal(false);
			renderTabelaEmprestimos();
		}, 300);
	});
}

function toggleEmprestimoModal(show) {
	const overlay = document.getElementById('modal-emprestimo-overlay');
	if (!overlay) return;
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirEmprestimo(id) {
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const idx = emprestimos.findIndex(e => e.id === id);
	if (idx === -1) return;
	const emprestimo = emprestimos[idx];
	if (emprestimo.status === 'Ativo' || emprestimo.status === 'Atrasado') {
		alert('Não é possível excluir empréstimos com status Ativo ou Atrasado. Atualize o status para Devolvido ou Perdido.');
		return;
	}
	const ok = confirm('Confirmar exclusão lógica deste empréstimo?');
	if (!ok) return;
	const snapshot = cloneRecord(emprestimo);
	emprestimo.ativo = false;
	emprestimo.excluidoEm = nowIsoString();
	emprestimo.excluidoPor = 'Administrador';
	saveEmprestimos(emprestimos);
	recordHistory('emprestimo', 'delete', snapshot);
	renderTabelaEmprestimos();
	updateHomeStats();
}

// ==== RESERVAS ====
function validarAlunoParaReserva(alunoId) {
	if (!alunoId) return 'Selecione um aluno.';
	const aluno = findAlunoById(alunoId);
	if (!aluno) return 'Aluno não encontrado.';
	if (aluno.status !== 'Ativo') return 'Somente alunos ativos podem realizar reservas.';
	if (aluno.status === 'Suspenso') return 'Alunos suspensos não podem reservar livros.';
	if (countReservasAtivasAluno(alunoId) >= MAX_RESERVAS_ATIVAS) {
		return `Limite de ${MAX_RESERVAS_ATIVAS} reservas ativas atingido para este aluno.`;
	}
	return '';
}

function validarLivroParaReserva(livroId, alunoId) {
	if (!livroId) return 'Selecione um livro.';
	const livro = findLivroById(livroId);
	if (!livro) return 'Livro não encontrado.';
	if (!livroTemEspacoParaReserva(livroId)) return 'Não há exemplares disponíveis para reserva.';
	if (existeReservaAtivaDuplicada(alunoId, livroId)) return 'Já existe uma reserva ativa deste aluno para o livro selecionado.';
	return '';
}

function setupReservaCadastro() {
	const form = document.getElementById('form-reserva-cadastro');
	if (!form) return;
	const alunoSelect = document.getElementById('reservaAluno');
	const livroSelect = document.getElementById('reservaLivro');
	const dataReservaInput = document.getElementById('reservaData');
	const dataExpiracaoInput = document.getElementById('reservaDataExpiracao');
	const statusSelect = document.getElementById('reservaStatus');
	const messages = document.getElementById('reserva-cadastro-messages');

	refreshReservaCadastroSelects();
	resetReservaCadastroDefaults(true);
	showMessage(messages, '', 'success');

	alunoSelect?.addEventListener('change', () => {
		const error = validarAlunoParaReserva(alunoSelect.value);
		if (error) showMessage(messages, error, 'error'); else showMessage(messages, '', 'success');
	});
	livroSelect?.addEventListener('change', () => {
		const alunoId = alunoSelect.value;
		if (!alunoId) return;
		const error = validarLivroParaReserva(livroSelect.value, alunoId);
		if (error) showMessage(messages, error, 'error'); else showMessage(messages, '', 'success');
	});

	form.addEventListener('reset', () => {
		setTimeout(() => {
			refreshReservaCadastroSelects();
			resetReservaCadastroDefaults(true);
			showMessage(messages, '', 'success');
		}, 0);
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const alunoId = alunoSelect.value;
		const livroId = livroSelect.value;
		const dataExpiracao = dataExpiracaoInput.value;
		const status = statusSelect.value || 'Ativa';

		if (!dataExpiracao) {
			showMessage(messages, 'Informe a data de expiração da reserva.', 'error');
			dataExpiracaoInput.focus();
			return;
		}
		const alunoError = validarAlunoParaReserva(alunoId);
		if (alunoError) {
			showMessage(messages, alunoError, 'error');
			alunoSelect.focus();
			return;
		}
		const livroError = validarLivroParaReserva(livroId, alunoId);
		if (livroError) {
			showMessage(messages, livroError, 'error');
			livroSelect.focus();
			return;
		}
		if (!RESERVA_STATUS.includes(status)) {
			showMessage(messages, 'Selecione um status de reserva válido.', 'error');
			statusSelect.focus();
			return;
		}
		const hoje = getTodayDateInputValue();
		// Validar que status 'Expirada' só pode ser usado se a data de expiração for ultrapassada
		if (status === 'Expirada' && dataExpiracao >= hoje) {
			showMessage(messages, 'O status "Expirada" só pode ser usado quando a data de expiração for ultrapassada.', 'error');
			statusSelect.focus();
			return;
		}
		// Para outros status, a data de expiração não pode ser anterior à data atual
		if (status !== 'Expirada' && dataExpiracao < hoje) {
			showMessage(messages, 'A data de expiração não pode ser anterior à data atual.', 'error');
			dataExpiracaoInput.focus();
			return;
		}
		const reservas = refreshReservaAutomaticStatuses();
		const novaReserva = {
			id: generateId(),
			alunoId,
			livroId,
			dataReserva: dataReservaInput.dataset.iso || nowIsoString(),
			dataExpiracao,
			status,
			ativo: true,
			criadoEm: nowIsoString()
		};
		reservas.push(novaReserva);
		saveReservas(reservas);
		showMessage(messages, 'Reserva registrada com sucesso!', 'success');
		form.reset();
		refreshReservaCadastroSelects();
		resetReservaCadastroDefaults(true);
		showMessage(messages, '', 'success');
		renderTabelaReservas();
		updateHomeStats();
		setTimeout(() => {
			window.location.hash = '#/reserva/consulta';
		}, 300);
	});
}

function aplicarFiltrosReservas(reservas, alunosMap, livrosMap) {
	const alunoTerm = document.getElementById('filtroReservaAluno')?.value.trim().toLocaleLowerCase() || '';
	const livroTerm = document.getElementById('filtroReservaLivro')?.value.trim().toLocaleLowerCase() || '';
	const statusFilter = document.getElementById('filtroReservaStatus')?.value || '';

	return reservas.filter((reserva) => {
		const aluno = alunosMap.get(reserva.alunoId);
		const livro = livrosMap.get(reserva.livroId);
		if (alunoTerm) {
			const nomeMatch = aluno?.nome?.toLocaleLowerCase().includes(alunoTerm);
			const matriculaMatch = aluno?.matricula?.toLocaleLowerCase().includes(alunoTerm);
			if (!nomeMatch && !matriculaMatch) return false;
		}
		if (livroTerm) {
			const tituloMatch = livro?.titulo?.toLocaleLowerCase().includes(livroTerm);
			const isbnMatch = livro?.isbn?.toLocaleLowerCase().includes(livroTerm);
			if (!tituloMatch && !isbnMatch) return false;
		}
		if (statusFilter && reserva.status !== statusFilter) return false;
		return true;
	});
}

function renderTabelaReservas() {
	const tbody = document.getElementById('tbody-reservas');
	if (!tbody) return;
	const reservas = refreshReservaAutomaticStatuses().filter(isRegistroAtivo);
	const alunosMap = new Map(loadAlunos().map(a => [a.id, a]));
	const livrosMap = new Map(loadLivros().map(l => [l.id, l]));
	const filtrados = aplicarFiltrosReservas(reservas, alunosMap, livrosMap)
		.sort((a, b) => new Date(b.dataReserva) - new Date(a.dataReserva));

	if (!filtrados.length) {
		tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma reserva encontrada.</td></tr>';
		return;
	}

	tbody.innerHTML = '';
	for (const reserva of filtrados) {
		const aluno = alunosMap.get(reserva.alunoId);
		const livro = livrosMap.get(reserva.livroId);
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(formatAlunoLabel(aluno))}</td>
			<td>${escapeHtml(formatLivroLabel(livro))}</td>
			<td>${escapeHtml(formatDateTimeDisplay(reserva.dataReserva))}</td>
			<td>${escapeHtml(formatDateToDisplay(reserva.dataExpiracao))}</td>
			<td>${escapeHtml(reserva.status)}</td>
			<td>
				<div class="actions">
					<button id="edit-reserva" class="btn" data-action="editar-reserva" data-id="${reserva.id}">Editar</button>
					<button class="btn danger" data-action="excluir-reserva" data-id="${reserva.id}">Excluir</button>
				</div>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function setupReservaConsulta() {
	const form = document.getElementById('form-reserva-filtro');
	const btnLimpar = document.getElementById('btnReservaLimparFiltros');
	const tbody = document.getElementById('tbody-reservas');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		renderTabelaReservas();
	});
	btnLimpar?.addEventListener('click', () => {
		document.getElementById('filtroReservaAluno').value = '';
		document.getElementById('filtroReservaLivro').value = '';
		document.getElementById('filtroReservaStatus').value = '';
		renderTabelaReservas();
	});
	tbody?.addEventListener('click', (e) => {
		const btn = e.target.closest('button[data-action]');
		if (!btn) return;
		const id = btn.getAttribute('data-id');
		const action = btn.getAttribute('data-action');
		if (action === 'editar-reserva') abrirModalReservaEdicao(id);
		if (action === 'excluir-reserva') excluirReserva(id);
	});
}

function abrirModalReservaEdicao(id) {
	const reservas = refreshReservaAutomaticStatuses();
	const reserva = reservas.find(r => r.id === id);
	if (!reserva || reserva.ativo === false) return;
	document.getElementById('edit-reserva-id').value = reserva.id;
	document.getElementById('edit-reserva-aluno').value = formatAlunoLabel(findAlunoById(reserva.alunoId));
	document.getElementById('edit-reserva-livro').value = formatLivroLabel(findLivroById(reserva.livroId));
	document.getElementById('edit-reserva-data').value = formatDateTimeDisplay(reserva.dataReserva);
	document.getElementById('edit-reserva-expiracao').value = reserva.dataExpiracao || getTodayDateInputValue();
	document.getElementById('edit-reserva-status').value = reserva.status;
	showMessage(document.getElementById('reserva-edicao-messages'), '', 'success');
	toggleReservaModal(true);
}

function setupReservaModalEdicao() {
	const overlay = document.getElementById('modal-reserva-overlay');
	const form = document.getElementById('form-reserva-edicao');
	const btnCancelar = document.getElementById('btnCancelarReservaEdicao');
	if (!form) return;

	overlay?.addEventListener('click', (e) => {
		if (e.target === overlay) toggleReservaModal(false);
	});
	btnCancelar?.addEventListener('click', () => toggleReservaModal(false));

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const id = document.getElementById('edit-reserva-id').value;
		const dataExpiracao = document.getElementById('edit-reserva-expiracao').value;
		const status = document.getElementById('edit-reserva-status').value;
		const messages = document.getElementById('reserva-edicao-messages');
		if (!dataExpiracao) {
			showMessage(messages, 'Informe a data de expiração.', 'error');
			return;
		}
		if (!RESERVA_STATUS.includes(status)) {
			showMessage(messages, 'Selecione um status válido.', 'error');
			return;
		}
		const reservas = refreshReservaAutomaticStatuses();
		const idx = reservas.findIndex(r => r.id === id);
		if (idx === -1) {
			showMessage(messages, 'Reserva não encontrada.', 'error');
			return;
		}
		const reserva = reservas[idx];
		const previous = cloneRecord(reserva);
		if (dataExpiracao < reserva.dataReserva?.slice(0, 10)) {
			showMessage(messages, 'A expiração não pode ser anterior à data da reserva.', 'error');
			return;
		}
		// Validar que status 'Expirada' só pode ser usado se a data de expiração for ultrapassada
		const hoje = getTodayDateInputValue();
		if (status === 'Expirada' && dataExpiracao >= hoje) {
			showMessage(messages, 'O status "Expirada" só pode ser usado quando a data de expiração for ultrapassada.', 'error');
			return;
		}
		reserva.dataExpiracao = dataExpiracao;
		reserva.status = status;
		if (status === 'Concluída' || status === 'Cancelada') {
			reserva.dataEncerramento = nowIsoString();
		} else if (status === 'Expirada') {
			reserva.dataExpiracao = dataExpiracao;
		} else {
			reserva.dataEncerramento = '';
		}
		recordHistory('reserva', 'edit', reserva, previous);
		saveReservas(reservas);
		showMessage(messages, 'Reserva atualizada com sucesso!', 'success');
		setTimeout(() => {
			toggleReservaModal(false);
			renderTabelaReservas();
		}, 300);
	});
}

function toggleReservaModal(show) {
	const overlay = document.getElementById('modal-reserva-overlay');
	if (!overlay) return;
	if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden');
}

function excluirReserva(id) {
	const reservas = refreshReservaAutomaticStatuses();
	const idx = reservas.findIndex(r => r.id === id);
	if (idx === -1) return;
	const reserva = reservas[idx];
	if (reserva.status === 'Ativa') {
		alert('Não é possível excluir uma reserva com status Ativa. Atualize o status para Cancelada ou Concluída.');
		return;
	}
	const ok = confirm('Confirmar exclusão lógica desta reserva?');
	if (!ok) return;
	const snapshot = cloneRecord(reserva);
	reserva.ativo = false;
	reserva.excluidaEm = nowIsoString();
	reserva.excluidaPor = 'Administrador';
	saveReservas(reservas);
	recordHistory('reserva', 'delete', snapshot);
	renderTabelaReservas();
	updateHomeStats();
}

function setupRelatorioGeneros() {
	const form = document.getElementById('form-relatorio-generos');
	const generosSelect = document.getElementById('relatorioGeneros');
	const btnHistorico = document.getElementById('btnRelatorioHistorico');
	const historicoBox = document.getElementById('relatorio-historico');
	if (!form || !generosSelect) return;

	populateGenreSelect(generosSelect);
	initSelectedChips('relatorioGeneros', 'relatorioGenerosChips');

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const dataInicio = (form.relatorioDataInicio.value || '').trim();
		const dataFim = (form.relatorioDataFim.value || '').trim();
		const generos = getSelectedValues(generosSelect);
		const messages = document.getElementById('relatorio-messages');
		if (!dataInicio || !dataFim) {
			showMessage(messages, 'Informe a data inicial e final para emitir o relatório.', 'error');
			return;
		}
		if (dataInicio > dataFim) {
			showMessage(messages, 'Data inicial não pode ser maior que a data final.', 'error');
			return;
		}
		const filtros = {
			dataInicio,
			dataFim,
			generos,
			periodo: `${formatDateToDisplay(dataInicio)} até ${formatDateToDisplay(dataFim)}`
		};
		const resultado = gerarRelatorioGeneros(filtros);
		recordRelatorioGenerosHistory(filtros, resultado.total);
		renderRelatorioGenerosHistory();
		if (!resultado.total) {
			renderRelatorioVazio();
			showMessage(messages, 'Nenhum empréstimo encontrado para os filtros informados.', 'error');
			return;
		}
		showMessage(messages, '', 'success');
		renderRelatorioGeneros(resultado, filtros);
	});

	form.addEventListener('reset', () => {
		setTimeout(() => {
			populateGenreSelect(generosSelect);
			initSelectedChips('relatorioGeneros', 'relatorioGenerosChips');
			renderRelatorioVazio();
			showMessage(document.getElementById('relatorio-messages'), '', 'success');
		}, 0);
	});

	btnHistorico?.addEventListener('click', () => {
		renderRelatorioGenerosHistory();
		historicoBox?.classList.remove('hidden');
		historicoBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});

	renderRelatorioGenerosHistory();
}

function gerarRelatorioGeneros(filtros) {
	const livrosMap = new Map(loadLivros().map(l => [l.id, l]));
	const alunosMap = new Map(loadAlunos().map(a => [a.id, a]));
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const inicio = filtros.dataInicio;
	const fim = filtros.dataFim;
	const generosFiltro = filtros.generos?.length ? new Set(filtros.generos) : null;
	const grupos = new Map();
	let total = 0;

	for (const emprestimo of emprestimos) {
		if (!emprestimo.dataEmprestimo) continue;
		const dataEmpDate = emprestimo.dataEmprestimo.slice(0, 10);
		if (!dataEmpDate || dataEmpDate < inicio || dataEmpDate > fim) continue;
		const livro = livrosMap.get(emprestimo.livroId);
		if (!livro || !(livro.generos || []).length) continue;
		const aluno = alunosMap.get(emprestimo.alunoId);
		for (const genero of livro.generos) {
			if (generosFiltro && !generosFiltro.has(genero)) continue;
			if (!grupos.has(genero)) grupos.set(genero, { total: 0, registros: [] });
			const grupo = grupos.get(genero);
			grupo.total += 1;
			total += 1;
			grupo.registros.push({
				aluno: formatAlunoLabel(aluno),
				data: emprestimo.dataEmprestimo,
				genero
			});
		}
	}

	for (const grupo of grupos.values()) {
		grupo.registros.sort((a, b) => new Date(a.data) - new Date(b.data));
	}

	return { grupos, total };
}

function renderRelatorioVazio() {
	const card = document.getElementById('relatorio-result');
	const detalhes = document.getElementById('relatorio-detalhes');
	card?.classList.add('hidden');
	if (detalhes) detalhes.innerHTML = '';
	if (relatorioPieChart) {
		relatorioPieChart.destroy();
		relatorioPieChart = null;
	}
	if (relatorioBarChart) {
		relatorioBarChart.destroy();
		relatorioBarChart = null;
	}
	document.getElementById('relatorio-pie-title').textContent = 'Gêneros Mais Emprestados (Percentual)';
	document.getElementById('relatorio-bar-title').textContent = 'Gêneros Mais Emprestados (Números Absolutos)';
}

function renderRelatorioGeneros(resultado, filtros) {
	const card = document.getElementById('relatorio-result');
	const detalhes = document.getElementById('relatorio-detalhes');
	if (!card || !detalhes) return;
	card.classList.remove('hidden');

	const labels = [];
	const data = [];
	const genreIds = new Map();
	let colorIndex = 0;

	detalhes.innerHTML = '';
	const fragment = document.createDocumentFragment();

	const sortedGrupos = [...resultado.grupos.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));

	for (const [genero, info] of sortedGrupos) {
		labels.push(genero);
		data.push(info.total);
		const color = RELATORIO_GENRE_COLORS[colorIndex % RELATORIO_GENRE_COLORS.length];
		colorIndex += 1;
		const groupDiv = document.createElement('div');
		groupDiv.className = 'relatorio-genre-group';
		groupDiv.dataset.relatorioGenero = genero;
		groupDiv.innerHTML = `<h4>${genero}</h4>`;
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		for (const registro of info.registros) {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${escapeHtml(registro.aluno)}</td>
				<td>${escapeHtml(formatDateTimeDisplay(registro.data))}</td>
				<td>${escapeHtml(registro.genero)}</td>
			`;
			tbody.appendChild(tr);
		}
		table.innerHTML = '<thead><tr><th>Aluno</th><th>Data / Horário</th><th>Gênero</th></tr></thead>';
		table.appendChild(tbody);
		groupDiv.appendChild(table);
		const subtotal = document.createElement('div');
		subtotal.className = 'relatorio-genre-total';
		subtotal.textContent = `Subtotal ${genero}: ${info.total}`;
		groupDiv.appendChild(subtotal);
		fragment.appendChild(groupDiv);
		genreIds.set(genero, color);
	}

	const totalGeral = document.createElement('div');
	totalGeral.className = 'relatorio-total-geral';
	totalGeral.textContent = `TOTAL de livros emprestados: ${resultado.total}`;
	fragment.appendChild(totalGeral);
	detalhes.appendChild(fragment);

	document.getElementById('relatorio-pie-title').textContent = `Gêneros mais alugados no período ${filtros.periodo}`;
	document.getElementById('relatorio-bar-title').textContent = `Quantidade de livros alugados no período ${filtros.periodo}`;

	// Aguarda o DOM atualizar antes de renderizar os gráficos
	setTimeout(() => {
		renderRelatorioCharts(labels, data, genreIds, resultado.total);
	}, 50);
}

function renderRelatorioCharts(labels, data, genreColors, total = 0) {
	if (typeof Chart === 'undefined') {
		console.error('Chart.js não está carregado');
		return;
	}

	const pieCtx = document.getElementById('relatorioPieChart');
	const barCtx = document.getElementById('relatorioBarChart');
	
	if (!pieCtx || !barCtx) {
		console.error('Elementos canvas não encontrados', { pieCtx: !!pieCtx, barCtx: !!barCtx });
		return;
	}

	if (!labels || !labels.length || !data || !data.length) {
		console.error('Dados vazios para gráficos', { labels, data });
		return;
	}

	const colors = labels.map(label => genreColors.get(label) || RELATORIO_GENRE_COLORS[0]);
	const absoluteData = data.slice();
	const totalCount = total || absoluteData.reduce((sum, value) => sum + value, 0);
	const pieData = totalCount
		? absoluteData.map(value => (value / totalCount) * 100)
		: absoluteData.map(() => 0);

	const legendConfig = {
		position: 'top',
		align: 'start',
		onClick: () => {},
		onHover: null,
		padding: {
			top: 0,
			bottom: 24,
			left: 0,
			right: 0
		},
		labels: {
			usePointStyle: true,
			pointStyle: 'circle',
			padding: 16,
			boxWidth: 10,
			color: '#0f172a',
			font: { family: RELATORIO_CHART_FONT, size: 12 }
		}
	};

	if (relatorioPieChart) {
		relatorioPieChart.destroy();
		relatorioPieChart = null;
	}
	if (relatorioBarChart) {
		relatorioBarChart.destroy();
		relatorioBarChart = null;
	}

	const onClick = (evt, elements) => {
		if (!elements || !elements.length) return;
		const index = elements[0].index;
		const genero = labels[index];
		const target = document.querySelector(`[data-relatorio-genero="${CSS?.escape ? CSS.escape(genero) : genero}"]`);
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		target?.classList.add('highlight');
		setTimeout(() => target?.classList.remove('highlight'), 1200);
	};

	try {
		const pieLabelsPlugin = {
			id: 'relatorioPieLabels',
			afterDatasetsDraw(chart) {
				const { ctx } = chart;
				ctx.save();
				try {
					const meta = chart.getDatasetMeta(0);
					if (!meta || !meta.data) return;
					const chartArea = chart.chartArea;
					const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
					const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
					
					meta.data.forEach((element, index) => {
						const percent = pieData[index];
						if (!percent || !element) return;
						
						// Calcular o ângulo médio da fatia
						const angle = (element.startAngle + element.endAngle) / 2;
						
						// Calcular a posição na borda externa da fatia
						const outerRadius = element.outerRadius;
						const labelRadius = outerRadius + 20;
						
						// Calcular posição do label baseado no centro do gráfico
						const x = centerX + Math.cos(angle) * labelRadius;
						const y = centerY + Math.sin(angle) * labelRadius;
						
						const text = `${labels[index]} ${percent.toFixed(1)}%`;
						ctx.font = `600 12px ${RELATORIO_CHART_FONT}`;
						ctx.fillStyle = '#0f172a';
						ctx.textBaseline = 'middle';
						
						// Determinar alinhamento baseado na posição relativa ao centro
						if (Math.abs(x - centerX) < 5) {
							// Próximo do centro verticalmente
							ctx.textAlign = 'center';
						} else if (x < centerX) {
							// Lado esquerdo
							ctx.textAlign = 'right';
						} else {
							// Lado direito
							ctx.textAlign = 'left';
						}
						
						// Ajustar posição Y se estiver muito próximo das bordas
						let finalY = y;
						const padding = 8;
						if (y < chartArea.top + padding) {
							finalY = chartArea.top + padding;
						} else if (y > chartArea.bottom - padding) {
							finalY = chartArea.bottom - padding;
						}
						
						ctx.fillText(text, x, finalY);
					});
				} catch (err) {
					console.error('Erro ao desenhar labels do gráfico pizza:', err);
				}
				ctx.restore();
			}
		};

		relatorioPieChart = new Chart(pieCtx, {
			type: 'pie',
			data: {
				labels,
				datasets: [{
					data: pieData,
					backgroundColor: colors,
					borderWidth: 0
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: { top: 24, right: 24, bottom: 40, left: 24 }
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label(context) {
								const genero = context.label || '';
								const percent = pieData[context.dataIndex] ?? 0;
								const absolute = absoluteData[context.dataIndex] ?? 0;
								const percentDisplay = Number(percent).toFixed(1);
								return `${genero}: ${percentDisplay}% (${absolute})`;
							}
						}
					}
				},
				onClick
			},
			plugins: [pieLabelsPlugin]
		});

		const barLabelsPlugin = {
			id: 'relatorioBarLabels',
			afterDatasetsDraw(chart) {
				const { ctx } = chart;
				ctx.save();
				try {
					const meta = chart.getDatasetMeta(0);
					if (!meta || !meta.data) return;
					meta.data.forEach((element, index) => {
						const value = absoluteData[index];
						if (!value || !element) return;
						const { x, y } = element.tooltipPosition();
						ctx.font = `600 12px ${RELATORIO_CHART_FONT}`;
						ctx.fillStyle = '#0f172a';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'bottom';
						ctx.fillText(value, x, y - 8);
					});
				} catch (err) {
					console.error('Erro ao desenhar labels do gráfico de barras:', err);
				}
				ctx.restore();
			}
		};

		// Configuração de legenda específica para o gráfico de barras
		const barLegendConfig = {
			...legendConfig,
			labels: {
				...legendConfig.labels,
				generateLabels: function(chart) {
					return labels.map((label, index) => ({
						text: label,
						fillStyle: colors[index],
						strokeStyle: colors[index],
						lineWidth: 0,
						hidden: false,
						index: index,
						datasetIndex: 0
					}));
				}
			}
		};

		relatorioBarChart = new Chart(barCtx, {
			type: 'bar',
			data: {
				labels,
				datasets: [{
					label: 'Empréstimos',
					data: absoluteData,
					backgroundColor: colors,
					borderRadius: 0,
					borderSkipped: false,
					maxBarThickness: 48
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: { top: 32, right: 12, bottom: 12, left: 12 }
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: '#0f172a', font: { family: RELATORIO_CHART_FONT } }
					},
					y: {
						beginAtZero: true,
						ticks: { stepSize: 1, color: '#0f172a', font: { family: RELATORIO_CHART_FONT } },
						title: { display: true, text: 'Quantidade absoluta', color: '#0f172a' },
						grid: {
							color: 'rgba(148, 163, 184, 0.5)',
							borderDash: [4, 4],
							drawBorder: false
						}
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label(context) {
								const genero = context.label || '';
								const value = absoluteData[context.dataIndex] ?? 0;
								const suffix = value === 1 ? 'empréstimo' : 'empréstimos';
								return `${genero}: ${value} ${suffix}`;
							}
						}
					}
				},
				onClick
			},
			plugins: [barLabelsPlugin]
		});
		
		console.log('Gráficos criados com sucesso');
	} catch (err) {
		console.error('Erro ao criar gráficos:', err);
	}
}

function recordRelatorioGenerosHistory(filtros, total) {
	const entries = loadRelatorioGenerosHistory();
	entries.push({
		dataHora: nowIsoString(),
		usuario: 'Bibliotecário',
		filtros,
		total
	});
	saveRelatorioGenerosHistory(entries.slice(-20));
}

function renderRelatorioGenerosHistory() {
	const container = document.getElementById('relatorio-historico');
	const list = document.getElementById('relatorio-historico-list');
	if (!container || !list) return;
	const entries = loadRelatorioGenerosHistory();
	list.innerHTML = '';
	if (!entries.length) {
		const li = document.createElement('li');
		li.className = 'empty';
		li.textContent = 'Nenhuma emissão registrada.';
		list.appendChild(li);
		return;
	}
	for (const entry of [...entries].reverse()) {
		const li = document.createElement('li');
		const periodo = entry.filtros?.periodo || '';
		const generos = entry.filtros?.generos?.length ? entry.filtros.generos.join(', ') : 'Todos';
		li.innerHTML = `<strong>${formatDateTimeDisplay(entry.dataHora)}</strong> — ${entry.usuario || 'Bibliotecário'}<br>Período: ${periodo || 'não informado'}<br>Gêneros: ${generos}<br>Total: ${entry.total || 0}`;
		list.appendChild(li);
	}
}

// ==== RELATÓRIO DE FAIXA ETÁRIA X EMPRÉSTIMO ====

function calcularIdade(dataNascimento, dataReferencia) {
	if (!dataNascimento || !dataReferencia) return null;
	const nasc = new Date(dataNascimento);
	const ref = new Date(dataReferencia);
	if (Number.isNaN(nasc.getTime()) || Number.isNaN(ref.getTime())) return null;
	let idade = ref.getFullYear() - nasc.getFullYear();
	const mesDiff = ref.getMonth() - nasc.getMonth();
	if (mesDiff < 0 || (mesDiff === 0 && ref.getDate() < nasc.getDate())) {
		idade--;
	}
	return idade;
}

function determinarFaixaEtaria(idade) {
	if (idade === null || idade === undefined) return null;
	if (idade >= 0 && idade <= 5) return '0-5';
	if (idade >= 6 && idade <= 11) return '6-11';
	if (idade >= 12 && idade <= 14) return '12-14';
	if (idade >= 15 && idade <= 17) return '15-17';
	if (idade >= 18) return '18+';
	return null;
}

function formatFaixaEtariaLabel(faixa) {
	const labels = {
		'0-5': '0 - 5',
		'6-11': '6 - 11',
		'12-14': '12 - 14',
		'15-17': '15 - 17',
		'18+': '18+'
	};
	return labels[faixa] || faixa;
}

function resolveFaixasEtariasFiltro(filtros) {
	if (!filtros) return [];
	const valores = Array.isArray(filtros.faixasEtarias) && filtros.faixasEtarias.length
		? filtros.faixasEtarias
		: (filtros.faixaEtaria ? [filtros.faixaEtaria] : []);
	return valores
		.map(value => (value || '').trim())
		.filter(Boolean);
}

function gerarRelatorioFaixaEtaria(filtros) {
	const alunosMap = new Map(loadAlunos().map(a => [a.id, a]));
	const emprestimos = refreshEmprestimoAutomaticStatuses();
	const inicio = filtros.dataInicio;
	const fim = filtros.dataFim;
	const faixasEtariaFiltro = resolveFaixasEtariasFiltro(filtros);
	const grupos = new Map();
	let total = 0;

	const faixasEtarias = ['0-5', '6-11', '12-14', '15-17', '18+'];
	for (const faixa of faixasEtarias) {
		grupos.set(faixa, { total: 0, registros: [] });
	}

	for (const emprestimo of emprestimos) {
		if (!emprestimo.dataEmprestimo) continue;
		const dataEmpDate = emprestimo.dataEmprestimo.slice(0, 10);
		if (!dataEmpDate || dataEmpDate < inicio || dataEmpDate > fim) continue;
		const aluno = alunosMap.get(emprestimo.alunoId);
		if (!aluno || !aluno.dataNascimento) continue;
		
		const idade = calcularIdade(aluno.dataNascimento, dataEmpDate);
		const faixaEtaria = determinarFaixaEtaria(idade);
		if (!faixaEtaria) continue;
		
		if (faixasEtariaFiltro.length && !faixasEtariaFiltro.includes(faixaEtaria)) continue;
		
		const grupo = grupos.get(faixaEtaria);
		grupo.total += 1;
		total += 1;
		grupo.registros.push({
			aluno: formatAlunoLabel(aluno),
			data: emprestimo.dataEmprestimo,
			faixaEtaria,
			idade
		});
	}

	// Ordenar registros por data crescente dentro de cada grupo
	for (const grupo of grupos.values()) {
		grupo.registros.sort((a, b) => new Date(a.data) - new Date(b.data));
	}

	return { grupos, total };
}

function renderRelatorioFaixaEtariaVazio() {
	const card = document.getElementById('relatorio-faixa-etaria-result');
	const detalhes = document.getElementById('relatorio-faixa-etaria-detalhes');
	card?.classList.add('hidden');
	if (detalhes) detalhes.innerHTML = '';
	if (relatorioFaixaEtariaBarChart) {
		relatorioFaixaEtariaBarChart.destroy();
		relatorioFaixaEtariaBarChart = null;
	}
	document.getElementById('relatorio-faixa-etaria-bar-title').textContent = 'Faixa Etária X Empréstimo';
}

function renderRelatorioFaixaEtaria(resultado, filtros) {
	const card = document.getElementById('relatorio-faixa-etaria-result');
	const detalhes = document.getElementById('relatorio-faixa-etaria-detalhes');
	if (!card || !detalhes) return;
	card.classList.remove('hidden');

	const labels = [];
	const data = [];
	const faixaEtariaIds = new Map();
	let colorIndex = 0;

	detalhes.innerHTML = '';
	const fragment = document.createDocumentFragment();

	// Ordenar faixas etárias na ordem correta
	const faixasEtarias = ['0-5', '6-11', '12-14', '15-17', '18+'];
	const sortedGrupos = faixasEtarias
		.map(faixa => [faixa, resultado.grupos.get(faixa)])
		.filter(([_, info]) => info && info.total > 0);

	for (const [faixa, info] of sortedGrupos) {
		labels.push(formatFaixaEtariaLabel(faixa));
		data.push(info.total);
		const color = RELATORIO_GENRE_COLORS[colorIndex % RELATORIO_GENRE_COLORS.length];
		colorIndex += 1;
		
		const groupDiv = document.createElement('div');
		groupDiv.className = 'relatorio-faixa-etaria-group';
		groupDiv.dataset.relatorioFaixaEtaria = faixa;
		groupDiv.innerHTML = `<h4>${formatFaixaEtariaLabel(faixa)}</h4>`;
		
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		for (const registro of info.registros) {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${escapeHtml(registro.aluno)}</td>
				<td>${escapeHtml(formatDateTimeDisplay(registro.data))}, ${escapeHtml(formatFaixaEtariaLabel(registro.faixaEtaria))}</td>
			`;
			tbody.appendChild(tr);
		}
		table.innerHTML = '<thead><tr><th>Cliente</th><th>Data, Horário, Faixa etária</th></tr></thead>';
		table.appendChild(tbody);
		groupDiv.appendChild(table);
		
		const subtotal = document.createElement('div');
		subtotal.className = 'relatorio-faixa-etaria-total';
		subtotal.textContent = `Subtotal ${formatFaixaEtariaLabel(faixa)}: ${info.total}`;
		groupDiv.appendChild(subtotal);
		fragment.appendChild(groupDiv);
		faixaEtariaIds.set(faixa, color);
	}

	const totalGeral = document.createElement('div');
	totalGeral.className = 'relatorio-total-geral';
	totalGeral.textContent = `TOTAL Pessoas: ${resultado.total}`;
	fragment.appendChild(totalGeral);
	detalhes.appendChild(fragment);

	document.getElementById('relatorio-faixa-etaria-bar-title').textContent = 
		`Faixa Etária X Empréstimo - Período ${filtros.periodo}`;

	// Aguarda o DOM atualizar antes de renderizar o gráfico
	setTimeout(() => {
		renderRelatorioFaixaEtariaChart(labels, data, faixaEtariaIds, resultado.total);
	}, 50);
}

function renderRelatorioFaixaEtariaChart(labels, data, faixaEtariaColors, total = 0) {
	if (typeof Chart === 'undefined') {
		console.error('Chart.js não está carregado');
		return;
	}

	const barCtx = document.getElementById('relatorioFaixaEtariaBarChart');
	if (!barCtx) {
		console.error('Elemento canvas não encontrado');
		return;
	}

	if (!labels || !labels.length || !data || !data.length) {
		console.error('Dados vazios para gráfico', { labels, data });
		return;
	}

	const faixasEtarias = ['0-5', '6-11', '12-14', '15-17', '18+'];
	const colors = labels.map((label, index) => {
		// Encontrar a faixa etária correspondente ao label
		const faixa = faixasEtarias.find(f => formatFaixaEtariaLabel(f) === label);
		return faixaEtariaColors.get(faixa) || RELATORIO_GENRE_COLORS[index % RELATORIO_GENRE_COLORS.length];
	});

	if (relatorioFaixaEtariaBarChart) {
		relatorioFaixaEtariaBarChart.destroy();
		relatorioFaixaEtariaBarChart = null;
	}

	const onClick = (evt, elements) => {
		if (!elements || !elements.length) return;
		const index = elements[0].index;
		const label = labels[index];
		// Encontrar a faixa etária correspondente ao label
		const faixa = faixasEtarias.find(f => formatFaixaEtariaLabel(f) === label);
		if (!faixa) return;
		const target = document.querySelector(`[data-relatorio-faixa-etaria="${CSS?.escape ? CSS.escape(faixa) : faixa}"]`);
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		target?.classList.add('highlight');
		setTimeout(() => target?.classList.remove('highlight'), 1200);
	};

	try {
		const barLabelsPlugin = {
			id: 'relatorioFaixaEtariaBarLabels',
			afterDatasetsDraw(chart) {
				const { ctx } = chart;
				ctx.save();
				try {
					const meta = chart.getDatasetMeta(0);
					if (!meta || !meta.data) return;
					meta.data.forEach((element, index) => {
						const value = data[index];
						if (!value || !element) return;
						const { x, y } = element.tooltipPosition();
						ctx.font = `600 12px ${RELATORIO_CHART_FONT}`;
						ctx.fillStyle = '#0f172a';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'bottom';
						ctx.fillText(value, x, y - 8);
					});
				} catch (err) {
					console.error('Erro ao desenhar labels do gráfico de barras:', err);
				}
				ctx.restore();
			}
		};

		relatorioFaixaEtariaBarChart = new Chart(barCtx, {
			type: 'bar',
			data: {
				labels,
				datasets: [{
					label: 'Empréstimos',
					data: data,
					backgroundColor: colors,
					borderRadius: 0,
					borderSkipped: false,
					maxBarThickness: 48
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: { top: 32, right: 12, bottom: 12, left: 12 }
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: '#0f172a', font: { family: RELATORIO_CHART_FONT } }
					},
					y: {
						beginAtZero: true,
						ticks: { stepSize: 1, color: '#0f172a', font: { family: RELATORIO_CHART_FONT } },
						title: { display: true, text: 'Quantidade de empréstimos', color: '#0f172a' },
						grid: {
							color: 'rgba(148, 163, 184, 0.5)',
							borderDash: [4, 4],
							drawBorder: false
						}
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label(context) {
								const faixa = context.label || '';
								const value = data[context.dataIndex] ?? 0;
								const suffix = value === 1 ? 'empréstimo' : 'empréstimos';
								return `${faixa}: ${value} ${suffix}`;
							}
						}
					}
				},
				onClick
			},
			plugins: [barLabelsPlugin]
		});
		
		console.log('Gráfico de faixa etária criado com sucesso');
	} catch (err) {
		console.error('Erro ao criar gráfico de faixa etária:', err);
	}
}

function recordRelatorioFaixaEtariaHistory(filtros, total) {
	const entries = loadRelatorioFaixaEtariaHistory();
	entries.push({
		dataHora: nowIsoString(),
		usuario: 'Bibliotecário',
		filtros,
		total
	});
	saveRelatorioFaixaEtariaHistory(entries.slice(-20));
}

function renderRelatorioFaixaEtariaHistory() {
	const container = document.getElementById('relatorio-faixa-etaria-historico');
	const list = document.getElementById('relatorio-faixa-etaria-historico-list');
	if (!container || !list) return;
	const entries = loadRelatorioFaixaEtariaHistory();
	list.innerHTML = '';
	if (!entries.length) {
		const li = document.createElement('li');
		li.className = 'empty';
		li.textContent = 'Nenhuma emissão registrada.';
		list.appendChild(li);
		return;
	}
	for (const entry of [...entries].reverse()) {
		const li = document.createElement('li');
		const periodo = entry.filtros?.periodo || '';
		const faixasSelecionadas = resolveFaixasEtariasFiltro(entry.filtros);
		const faixaEtaria = faixasSelecionadas.length
			? faixasSelecionadas.map(formatFaixaEtariaLabel).join(', ')
			: 'Todas';
		li.innerHTML = `<strong>${formatDateTimeDisplay(entry.dataHora)}</strong> — ${entry.usuario || 'Bibliotecário'}<br>Período: ${periodo || 'não informado'}<br>Faixa etária: ${faixaEtaria}<br>Total: ${entry.total || 0}`;
		list.appendChild(li);
	}
}

function setupRelatorioFaixaEtaria() {
	const form = document.getElementById('form-relatorio-faixa-etaria');
	const btnHistorico = document.getElementById('btnRelatorioFaixaEtariaHistorico');
	const historicoBox = document.getElementById('relatorio-faixa-etaria-historico');
	const faixaSelect = document.getElementById('relatorioFaixaEtaria');
	if (!form || !faixaSelect) return;

	for (const option of Array.from(faixaSelect.options || [])) {
		option.selected = false;
	}
	initSelectedChips('relatorioFaixaEtaria', 'relatorioFaixaEtariaChips');

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const dataInicio = (form.relatorioFaixaEtariaDataInicio.value || '').trim();
		const dataFim = (form.relatorioFaixaEtariaDataFim.value || '').trim();
		const faixasEtariasSelecionadas = getSelectedValues(faixaSelect);
		const messages = document.getElementById('relatorio-faixa-etaria-messages');
		if (!dataInicio || !dataFim) {
			showMessage(messages, 'Informe a data inicial e final para emitir o relatório.', 'error');
			return;
		}
		if (dataInicio > dataFim) {
			showMessage(messages, 'Data inicial não pode ser maior que a data final.', 'error');
			return;
		}
		const filtros = {
			dataInicio,
			dataFim,
			faixasEtarias: faixasEtariasSelecionadas,
			periodo: `${formatDateToDisplay(dataInicio)} até ${formatDateToDisplay(dataFim)}`
		};
		const resultado = gerarRelatorioFaixaEtaria(filtros);
		recordRelatorioFaixaEtariaHistory(filtros, resultado.total);
		renderRelatorioFaixaEtariaHistory();
		if (!resultado.total) {
			renderRelatorioFaixaEtariaVazio();
			showMessage(messages, 'Nenhum empréstimo encontrado para os filtros informados.', 'error');
			return;
		}
		showMessage(messages, '', 'success');
		renderRelatorioFaixaEtaria(resultado, filtros);
	});

	form.addEventListener('reset', () => {
		setTimeout(() => {
			for (const option of Array.from(faixaSelect.options || [])) {
				option.selected = false;
			}
			refreshSelectChips(faixaSelect);
			renderRelatorioFaixaEtariaVazio();
			showMessage(document.getElementById('relatorio-faixa-etaria-messages'), '', 'success');
		}, 0);
	});

	btnHistorico?.addEventListener('click', () => {
		const isHidden = historicoBox.classList.contains('hidden');
		if (isHidden) {
			renderRelatorioFaixaEtariaHistory();
			historicoBox.classList.remove('hidden');
			historicoBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			historicoBox.classList.add('hidden');
		}
	});

	renderRelatorioFaixaEtariaHistory();
}
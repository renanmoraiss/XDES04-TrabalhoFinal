const STORAGE_KEY = 'alunos';
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
const STORAGE_KEY_AUTORES = 'autores';
const STORAGE_KEY_EDITORAS = 'editoras';
const STORAGE_KEY_LIVROS = 'livros';
const BOOK_GENRES = [
	'Ficção Científica',
	'Fantasia',
	'Mistério',
	'Suspense',
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
	'Young Adult',
	'HQ e Mangá',
	'Graphic Novel',
	'Literatura Brasileira',
	'Chick-lit',
	'Humor',
	'Religião',
	'Espiritualidade',
	'Educação',
	'Culinária'
];

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
	refreshLivroRelatedSelects();
}

function loadEditoras() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_EDITORAS);
		if (!raw) return [];
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list;
	} catch {
		return [];
	}
}

function saveEditoras(editoras) {
	localStorage.setItem(STORAGE_KEY_EDITORAS, JSON.stringify(editoras));
	refreshLivroRelatedSelects();
}

function loadLivros() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_LIVROS);
		if (!raw) return [];
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list;
	} catch {
		return [];
	}
}

function saveLivros(livros) {
	localStorage.setItem(STORAGE_KEY_LIVROS, JSON.stringify(livros));
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

function formatPhoneEditora(value) {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 13);
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
	const digits = input.value.replace(/\D/g, '').slice(0, 13);
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
			opt.textContent = 'Cadastre autores antes de adicionar livros.';
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
	livro: { edit: 'hist_livro_edicoes', delete: 'hist_livro_exclusoes' }
};
const ENTITY_LABELS = {
	aluno: 'Alunos',
	autor: 'Autores',
	editora: 'Editoras',
	livro: 'Livros'
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

function cloneRecord(record) {
	if (!record) return null;
	if (typeof structuredClone === 'function') {
		try { return structuredClone(record); } catch { /* falls through */ }
	}
	return JSON.parse(JSON.stringify(record));
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
	if (elAlunos) elAlunos.textContent = String(loadAlunos().length);
	if (elAutores) elAutores.textContent = String(loadAutores().length);
	if (elEditoras) elEditoras.textContent = String(loadEditoras().length);
	if (elLivros) elLivros.textContent = String(loadLivros().length);
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
		const nascimentoAno = Number(vNascimento.slice(0, 4));
		if (nascimentoAno > 2025) {
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
	const filtroNome = document.getElementById('filtroNome');
	enforceNumericInput(document.getElementById('filtroMatricula'), 4);
	
	// Restringe campo Nome para apenas letras
	if (filtroNome) {
		filtroNome.addEventListener('input', () => {
			const raw = filtroNome.value;
			const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
			if (raw !== cleaned) filtroNome.value = cleaned;
		});
	}

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
		// Permite letras e números
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
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

	nome.addEventListener('input', () => {
		// Permite letras e números
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	telefone.addEventListener('input', () => applyPhoneEditoraMask(telefone));
	telefone.addEventListener('blur', () => applyPhoneEditoraMask(telefone));
	endereco.addEventListener('input', () => {
		const raw = endereco.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) endereco.value = cleaned;
	});

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
		if (!vTelefoneDigits || !digitsRegex.test(vTelefoneDigits) || vTelefoneDigits.length > 13) {
			showMessage(messages, 'Telefone de Contato é obrigatório, deve conter apenas números e ter no máximo 13 dígitos.', 'error');
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

	nome?.addEventListener('input', () => {
		// Permite letras e números
		const raw = nome.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
		if (raw !== cleaned) nome.value = cleaned;
	});
	telefone?.addEventListener('input', () => applyPhoneEditoraMask(telefone));
	telefone?.addEventListener('blur', () => applyPhoneEditoraMask(telefone));
	endereco?.addEventListener('input', () => {
		const raw = endereco.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) endereco.value = cleaned;
	});

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
		if (!vTelefoneDigits || !digitsRegex.test(vTelefoneDigits) || vTelefoneDigits.length > 13) {
			showMessage(messages, 'Telefone de Contato é obrigatório, deve conter apenas números e ter no máximo 13 dígitos.', 'error');
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

	titulo.addEventListener('input', () => {
		const raw = titulo.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
		if (raw !== cleaned) titulo.value = cleaned;
	});
	isbn.addEventListener('input', () => applyIsbnMask(isbn));
	isbn.addEventListener('blur', () => applyIsbnMask(isbn));
	localizacao.addEventListener('input', () => {
		const raw = localizacao.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) localizacao.value = cleaned;
	});
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
	if (filtroLivroAutor) {
		filtroLivroAutor.addEventListener('input', () => {
			const raw = filtroLivroAutor.value;
			const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
			if (raw !== cleaned) filtroLivroAutor.value = cleaned;
		});
	}

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

	titulo.addEventListener('input', () => {
		const raw = titulo.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
		if (raw !== cleaned) titulo.value = cleaned;
	});
	isbn.addEventListener('input', () => applyIsbnMask(isbn));
	isbn.addEventListener('blur', () => applyIsbnMask(isbn));
	localizacao.addEventListener('input', () => {
		const raw = localizacao.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) localizacao.value = cleaned;
	});
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

	nome.addEventListener('input', () => {
		// Apenas letras para nome de autor
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
		// Permite letras e números
		const raw = biografia.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) biografia.value = cleaned;
	});

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
	if (filtroAutorNome) {
		filtroAutorNome.addEventListener('input', () => {
			const raw = filtroAutorNome.value;
			const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
			if (raw !== cleaned) filtroAutorNome.value = cleaned;
		});
	}
	
	// Restringe campo Nacionalidade para apenas letras
	if (filtroAutorNacionalidade) {
		filtroAutorNacionalidade.addEventListener('input', () => {
			const raw = filtroAutorNacionalidade.value;
			const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s]/gu, '');
			if (raw !== cleaned) filtroAutorNacionalidade.value = cleaned;
		});
	}

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
		// Apenas letras para nome de autor
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
		// Permite letras e números
		const raw = biografia.value;
		const cleaned = raw.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.,;:!?'"\-()]/gu, '');
		if (raw !== cleaned) biografia.value = cleaned;
	});

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
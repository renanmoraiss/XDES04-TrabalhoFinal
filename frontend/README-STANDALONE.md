# Sistema de Biblioteca - Versão HTML Standalone

Esta é uma versão standalone do sistema que funciona **sem necessidade de instalar Node.js ou qualquer dependência**. Basta abrir o arquivo HTML no navegador!

## 🚀 Como Usar

### Opção 1: Abrir Diretamente
1. Navegue até a pasta `C:\Users\Master\frontend`
2. Abra o arquivo `index-standalone.html` no seu navegador
3. Pronto! O sistema está funcionando

### Opção 2: Servidor Local (Recomendado)
Para evitar problemas com CORS, você pode usar um servidor HTTP simples:

**Com Python (se instalado):**
```bash
cd C:\Users\Master\frontend
python -m http.server 8000
```
Depois acesse: `http://localhost:8000/index-standalone.html`

**Com Node.js (se instalado):**
```bash
cd C:\Users\Master\frontend
npx http-server -p 8000
```
Depois acesse: `http://localhost:8000/index-standalone.html`

## 📋 Funcionalidades Implementadas

### Alunos (RFS05-RFS08)
- ✅ **Inserir Aluno (RFS05)**: Cadastro com validação de matrícula e email únicos
- ✅ **Consultar Aluno (RFS06)**: Busca com filtros (nome, matrícula, status, pendências) e ordenação alfabética
- ✅ **Alterar Aluno (RFS07)**: Edição de campos permitidos com histórico de alterações
- ✅ **Excluir Aluno (RFS08)**: Exclusão lógica com validação de pendências

### Autores (RFS13-RFS16)
- ✅ **Inserir Autor (RFS13)**: Cadastro sem validação
- ✅ **Consultar Autor (RFS14)**: Busca com filtros (nome, nacionalidade) e ordenação alfabética
- ✅ **Alterar Autor (RFS15)**: Edição de todos os campos com histórico de alterações
- ✅ **Excluir Autor (RFS16)**: Exclusão lógica com validação de livros associados

## 🎨 Características

- ✅ **Interface Moderna**: Design limpo e responsivo
- ✅ **Validações Completas**: Todos os campos validados conforme especificação
- ✅ **Formatação Automática**: ISBN, datas e telefones formatados automaticamente
- ✅ **Armazenamento Local**: Dados salvos no localStorage do navegador
- ✅ **Sem Dependências**: Funciona apenas com HTML, CSS e JavaScript puro

## 💾 Armazenamento de Dados

Os dados são salvos no **localStorage** do navegador. Isso significa:
- Os dados persistem mesmo após fechar o navegador
- Cada navegador tem seus próprios dados (não compartilha entre navegadores)
- Para limpar os dados, use o console do navegador: `localStorage.clear()`

## 🔧 Estrutura de Arquivos

```
frontend/
├── index-standalone.html  ← Arquivo principal (abra este!)
├── app.js                  ← Lógica JavaScript completa
└── README-STANDALONE.md    ← Este arquivo
```

## 📝 Notas Importantes

1. **Compatibilidade**: Funciona em todos os navegadores modernos (Chrome, Firefox, Edge, Safari)

2. **Dados**: Os dados são salvos localmente no navegador. Se você limpar o cache do navegador, os dados serão perdidos.

3. **Validações**: Todas as validações dos requisitos funcionais estão implementadas:
   - ISBN com 10 ou 13 dígitos e formatação automática
   - Verificação de duplicidade de ISBN e matrícula
   - Validação de email
   - Campos obrigatórios marcados com *

4. **Histórico**: O sistema registra alterações (em memória, não persistido na versão standalone)

## 🐛 Solução de Problemas

**Problema**: A página não carrega corretamente
- **Solução**: Certifique-se de que o arquivo `app.js` está na mesma pasta que `index-standalone.html`

**Problema**: Erros no console do navegador
- **Solução**: Abra o console (F12) e verifique se há erros. Certifique-se de que está abrindo o arquivo via `file://` ou servidor HTTP

**Problema**: Dados não estão sendo salvos
- **Solução**: Verifique se o localStorage está habilitado no navegador (geralmente está por padrão)

## 🎯 Próximos Passos

Para usar em produção, você pode:
1. Conectar a uma API backend substituindo as funções do `StorageService`
2. Adicionar autenticação e controle de acesso
3. Implementar sincronização com servidor
4. Adicionar testes automatizados

---

**Desenvolvido conforme especificações dos Requisitos Funcionais RFS05-RFS08 & RFS13-RFS16**

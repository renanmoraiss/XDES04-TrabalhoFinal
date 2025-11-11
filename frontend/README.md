# Sistema de Biblioteca - Frontend

Sistema de gerenciamento de biblioteca desenvolvido em React com TypeScript, implementando os requisitos funcionais especificados.

## Funcionalidades Implementadas

### Livros (RFS01-RFS04)
- ✅ **Inserir Livro (RFS01)**: Cadastro completo com validação de ISBN, autores multivalorados, gêneros múltiplos
- ✅ **Consultar Livro (RFS02)**: Busca com filtros (título, autor, ISBN, gênero) e ordenação alfabética
- ✅ **Alterar Livro (RFS03)**: Edição de todos os campos com histórico de alterações
- ✅ **Excluir Livro (RFS04)**: Exclusão lógica com validação de empréstimos ativos

### Alunos (RFS05-RFS08)
- ✅ **Inserir Aluno (RFS05)**: Cadastro com validação de matrícula e email únicos
- ✅ **Consultar Aluno (RFS06)**: Busca com filtros (nome, matrícula, status, pendências) e ordenação alfabética
- ✅ **Alterar Aluno (RFS07)**: Edição de campos permitidos com histórico de alterações
- ✅ **Excluir Aluno (RFS08)**: Exclusão lógica com validação de pendências

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **React Router DOM** - Roteamento para aplicações React
- **Vite** - Build tool moderna e rápida
- **CSS3** - Estilização com design moderno e responsivo

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse no navegador:
```
http://localhost:5173
```

## Estrutura do Projeto

```
sistema-biblioteca/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout.tsx       # Layout principal com navegação
│   │   └── Layout.css
│   ├── pages/               # Páginas da aplicação
│   │   ├── Home.tsx         # Página inicial
│   │   ├── livros/          # Páginas de gerenciamento de livros
│   │   │   ├── InserirLivro.tsx
│   │   │   ├── ConsultarLivro.tsx
│   │   │   ├── AlterarLivro.tsx
│   │   │   ├── LivroForm.css
│   │   │   └── ConsultarLivro.css
│   │   └── alunos/          # Páginas de gerenciamento de alunos
│   │       ├── InserirAluno.tsx
│   │       ├── ConsultarAluno.tsx
│   │       ├── AlterarAluno.tsx
│   │       ├── AlunoForm.css
│   │       └── ConsultarAluno.css
│   ├── routes/              # Configuração de rotas
│   │   ├── LivroRoutes.tsx
│   │   └── AlunoRoutes.tsx
│   ├── services/            # Serviços de armazenamento
│   │   └── storage.ts       # Gerenciamento com localStorage
│   ├── types/               # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── utils/               # Funções utilitárias
│   │   └── validations.ts   # Validações e formatações
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Validações Implementadas

### Livros
- ✅ Título obrigatório (máx. 255 caracteres)
- ✅ Pelo menos um autor obrigatório
- ✅ ISBN válido (10 ou 13 dígitos) com formatação automática
- ✅ Verificação de duplicidade de ISBN
- ✅ Pelo menos um gênero obrigatório
- ✅ Exemplares obrigatório (≥ 0)
- ✅ Localização física (máx. 100 caracteres)

### Alunos
- ✅ Nome obrigatório (máx. 150 caracteres)
- ✅ Nº de Matrícula obrigatório (exatamente 4 caracteres)
- ✅ Verificação de duplicidade de matrícula
- ✅ E-mail institucional obrigatório e válido (máx. 100 caracteres)
- ✅ Verificação de duplicidade de e-mail
- ✅ Data de nascimento no formato DD/MM/AAAA
- ✅ Telefone válido (10-15 dígitos)
- ✅ Status padrão: "Ativo"

## Características do Design

- 🎨 Interface moderna e limpa
- 📱 Design responsivo (mobile-first)
- ✨ Animações suaves
- 🎯 Feedback visual claro para ações do usuário
- 🔍 Busca e filtros intuitivos
- 📋 Formulários bem estruturados com validação em tempo real

## Armazenamento

O sistema utiliza `localStorage` para persistência de dados. Em produção, isso seria substituído por chamadas a uma API REST.

## Próximos Passos

Para integração com backend:
1. Substituir `storageService` por chamadas HTTP (fetch/axios)
2. Implementar autenticação e controle de acesso
3. Adicionar tratamento de erros de rede
4. Implementar loading states
5. Adicionar testes unitários e de integração

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## Licença

Este projeto foi desenvolvido para fins educacionais.


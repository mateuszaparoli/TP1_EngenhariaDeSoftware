# Trabalho Prático 1 - Engenharia de Software - 2025/2   

**Professor**: Marco Tulio Valente  

---

## Equipe  
  
| Nome                            | Papel                   | 
| :------------------------------ | :---------------------- | 
| Bruno Buti Ferreira Guilherme   | Desenvolvedor Backend   |  
| João Vitor Vieira Neves         | Desenvolvedor FullStack |  
| Mateus Faria Zaparoli Monteiro  | Desenvolvedor FullStack |
| Ricardo Shen                    | Desenvolvedor FullStack |
  
---  

## Backlog da Sprint

## **História #1:** Como administrador, eu quero cadastrar (editar, deletar) um evento. (Exemplo: Simpósio Brasileiro de Engenharia de Software)

### **Tarefas e responsáveis:**

- Instalar banco de dados e criar tabela para eventos [Bruno]
- Criar modelo de dados (entidade) para Evento [Mateus]
- Implementar endpoints no backend para CRUD de eventos [Mateus]
- Implementar tela de listagem de eventos [Ricardo]
- Implementar formulário de cadastro/edição de eventos [João]
- Implementar funcionalidade de exclusão de eventos [Ricardo]
- Conectar frontend com backend (integração) [Ricardo]

---

## **História #2:** Como administrador, eu quero cadastrar (editar, deletar) uma nova edição de um evento (exemplo: edição de 2025 do SBES)

### **Tarefas e responsáveis:**

- Criar tabela para edições de eventos com relacionamento [Mateus]
- Criar modelo de dados (entidade) para Edição [Mateus]
- Implementar endpoints no backend para CRUD de edições de eventos [Mateus]
- Implementar tela de listagem de edições de eventos [Ricardo]
- Implementar formulário de cadastro/edição de edições de eventos [Ricardo]
- Implementar funcionalidade de exclusão de edições de eventos [João]
- Conectar frontend com backend (integração) [Bruno]

---

## **História #3:** Como administrador, eu quero cadastrar (editar, deletar) um artigo manualmente, incluindo seu pdf

### **Tarefas e responsáveis:**

- Criar tabela de artigos no banco de dados [Mateus]
- Configurar armazenamento de arquivos (upload de PDF) [Mateus]
- Criar modelo de dados para Artigo [Mateus]
- Implementar endpoints no backend para CRUD de artigos [Mateus]
- Implementar endpoint para upload de PDF [Bruno]
- Implementar tela de listagem de artigos [Ricardo]
- Implementar formulário de cadastro/edição de artigos com upload de PDF [João]
- Implementar funcionalidade de exclusão de artigos [Ricardo]
- Conectar frontend com backend (integração) [Mateus]

---

## **História #4:** Como administrador, eu quero cadastrar artigos em massa, a partir de um arquivo bibtex, com dados de vários artigos

### **Tarefas e responsáveis:**

- Pesquisar e escolher biblioteca para parsing de arquivos BibTeX [João]
- Implementar parser de arquivo BibTeX no backend [João]
- Criar endpoint para upload e processamento de arquivo BibTeX [Mateus]
- Implementar lógica de validação e tratamento de erros no processamento [Ricardo]
- Implementar lógica de inserção em massa de artigos no banco de dados [João]
- Implementar tela de upload de arquivo BibTeX [João]
- Implementar feedback visual do processamento (progresso, erros, sucessos) [Ricardo]
- Conectar frontend com backend (integração) [Bruno]
- Testar importação com diferentes arquivos BibTeX [Ricardo]

## **História #5:** Como usuário, eu quero pesquisar por artigos: por título, por autor e por nome de evento

### Tarefas e responsáveis:

- Implementar endpoint no backend para pesquisar artigos com filtros [Mateus]
- Criar componente de barra de pesquisa no frontend [João]
- Implementar tela para exibição dos resultados da pesquisa [Ricardo]
- Adicionar lógica de paginação aos resultados da pesquisa [Ricardo]
- Conectar a interface de pesquisa com o backend (integração) [Bruno]
- Realizar testes na funcionalidade de busca [Mateus]

## ** História #6: ** Como administrador, eu quero que todo evento tenha uma home page, com suas edições; cada edição, por sua vez, também deve ter uma home page, com seus artigos.

### Tarefas e responsáveis:

- Implementar endpoint no backend para retornar dados de um evento e suas edições [Mateus]
- Implementar endpoint no backend para retornar dados de uma edição e seus artigos [Mateus]
- Criar rota e página dinâmica para a home page de um evento (ex: /sbes) [João]
- Criar rota e página dinâmica para a home page de uma edição (ex: /sbes/2025) [João]
- Implementar a interface da página de evento, listando suas edições [Ricardo]
- Implementar a interface da página de edição, listando seus artigos [Ricardo]
- Conectar as páginas do frontend com os endpoints do backend (integração) [Bruno]
- História #7: Como usuário, eu quero ter uma home page com meus artigos, organizados por ano
- Implementar endpoint no backend para retornar artigos de um autor, agrupados por ano [Mateus]
- Criar rota e página dinâmica para a página do autor (ex: /author/nome-autor) [João]
- Implementar a interface da página do autor, exibindo os artigos por ano [Ricardo]
- Conectar a página do autor com o endpoint do backend (integração) [Bruno]
- Garantir que os nomes dos autores nos artigos sejam links para suas respectivas páginas [João]

## ** História #7: ** Como usuário, eu quero ter uma home page com meus artigos, organizados por ano

### Tarefas e responsáveis:

- Implementar endpoint no backend para retornar artigos de um autor, agrupados por ano [Mateus]
- Criar rota e página dinâmica para a página do autor (ex: /author/nome-autor) [João]
- Implementar a interface da página do autor, exibindo os artigos por ano [Ricardo]
- Conectar a página do autor com o endpoint do backend (integração) [Bruno]
- Garantir que os nomes dos autores nos artigos sejam links para suas respectivas páginas [João]


## ** História #8: ** Como usuário, eu quero me cadastrar para receber um mail sempre que eu tiver um novo artigo disponibilizado

### Tarefas e responsáveis:

- Criar tabela no banco de dados para armazenar subscrições de email por autor [Bruno]
- Implementar endpoint no backend para registrar a subscrição de um email a um autor [Mateus]
- Integrar um serviço de envio de emails no backend [Ricardo]
- Implementar a lógica de notificação por email quando um novo artigo for adicionado [Ricardo]
- Implementar botão/formulário de subscrição na página do autor no frontend [João]
- Conectar o formulário de subscrição com o backend (integração) [Ricardo]


## Sobre o Sistema

Este projeto consiste em uma **biblioteca digital de artigos científicos** que permite gerenciar eventos acadêmicos, suas edições e artigos publicados. O sistema foi desenvolvido com foco em simpósios brasileiros como SBES (Simpósio Brasileiro de Engenharia de Software) e SBCARS (Simpósio Brasileiro de Arquitetura de Software).

### 🎯 Funcionalidades Principais

- **Gestão de Eventos**: Cadastro, edição e exclusão de eventos acadêmicos
- **Gestão de Edições**: Controle de edições anuais dos eventos com localização e datas
- **Gestão de Artigos**: Cadastro manual e em massa (via BibTeX) com upload de PDFs
- **Busca Avançada**: Pesquisa por título, autor ou nome do evento
- **Páginas Dedicadas**: Home pages para eventos, edições e autores
- **Sistema de Notificações**: Cadastro para receber emails sobre novos artigos

### 📋 User Stories e Testes de Aceitação

O sistema foi desenvolvido seguindo 8 user stories principais, conforme especificado nos testes de aceitação:

1. **Gestão de Eventos** - Cadastro, edição e exclusão de eventos
2. **Gestão de Edições** - Controle de edições anuais dos eventos
3. **Cadastro Manual de Artigos** - Inclusão individual com upload de PDF
4. **Cadastro em Massa** - Import via arquivo BibTeX com ZIP de PDFs
5. **Sistema de Busca** - Pesquisa por título, autor e evento
6. **Navegação Hierárquica** - Páginas `/evento` e `/evento/ano`
7. **Páginas de Autores** - Perfis individuais com artigos organizados por ano
8. **Sistema de Notificações** - Cadastro em sistema de notificação para receber e-mails de autores selecionados

## Tecnologias e Ferramentas  
  
### 💻 Back-end  
* **Linguagem:** Python3 
* **Framework:** Django + Django REST Framework
* **Banco de Dados:** SQLite 
* **ORM:** Django ORM
* **Upload de Arquivos:** Suporte para upload de arquivos em formato PDF e BibTeX

### 🌐 Front-end  
* **Linguagem:** TypeScript
* **Framework:** React 18.x
* **Build Tool:** Vite
* **UI Components:** shadcn/ui + Radix UI
* **Styling:** Tailwind CSS
* **Roteamento:** React Router DOM
* **Gerenciamento de Estado:** React Query
* **Plataforma de Desenvolvimento:** Lovable

### 🧠 Ferramenta de IA  
* **Ferramenta:** GitHub Copilot (Modo Agent)
* **Uso:** Assistência no desenvolvimento, geração de código e resolução de problemas

### 🛠️ Ferramentas de Desenvolvimento
* **Bundler:** NPM (Frontend)
* **Linting:** ESLint
* **Tipagem:** TypeScript
* **Formulários:** React Hook Form + Zod
* **Ícones:** Lucide React

---

## Modelos de Dados

O sistema utiliza os seguintes modelos principais:

- **Event**: Eventos acadêmicos - Nome do evento, Sigla, Entidade Promotora
- **Edition**: Edições anuais dos eventos - Evento, Ano, Local, Data de Início, Data de Término
- **Author**: Autores dos artigos - Nome, E-mail
- **Article**: Artigos científicos - Título, Resumo, Autores, Páginas, PDF

## Como Executar

### Backend (Django)
```bash
cd django
python manage.py migrate
python manage.py runserver
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install
npm run dev
```

O backend roda em `http://localhost:8000` e o frontend em `http://localhost:8080`.

---

## Tratamento de Erros

O sistema implementa validações robustas, especialmente no upload de arquivos BibTeX:
- Campos obrigatórios ausentes resultam em artigos ignorados
- Relatório detalhado de erros no final do processamento
- Validação de integridade de arquivos PDF

## APIs Disponíveis

O backend expõe uma API REST completa para todas as operações CRUD dos modelos, permitindo integração completa com o frontend TypeScript.

---

## Diagrama UML
https://github.com/mateuszaparoli/TP1_EngenhariaDeSoftware/blob/main/diagrama.md

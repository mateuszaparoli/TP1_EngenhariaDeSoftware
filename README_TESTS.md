# TP2 - Engenharia de Software
## Testes de Unidade, Integração e End-to-End

Este documento explica como executar todos os testes implementados para o TP2.

## Estrutura de Testes

### 1. Testes de Unidade/Integração (Django)
Localizados em: `django/tests/`

- **test_models.py**: Testes de unidade para os modelos (Event, Edition, Article, Author, Subscription)
- **test_views.py**: Testes de integração para as APIs/Views
- **test_special_features.py**: Testes para funcionalidades específicas (BibTeX import, upload de PDFs)
- **factories.py**: Factories para gerar dados de teste

### 2. Testes End-to-End (Frontend)
Localizados em: `frontend/tests/e2e/`

- **article-search.spec.ts**: Navegação e busca de artigos
- **article-creation.spec.ts**: Criação e edição de artigos  
- **pdf-upload.spec.ts**: Funcionalidade de upload de PDFs
- **subscription-system.spec.ts**: Sistema de subscrições

## Como Executar os Testes

### Pré-requisitos

1. **Backend (Django)**:
   ```bash
   cd django
   pip install pytest pytest-django pytest-cov factory-boy faker
   ```

2. **Frontend (React)**:
   ```bash
   cd frontend
   npm install
   npm install --save-dev @playwright/test
   npx playwright install
   ```

### Executar Testes de Unidade/Integração (Django)

1. **Executar todos os testes**:
   ```bash
   cd django
   pytest
   ```

2. **Executar testes com cobertura**:
   ```bash
   cd django
   pytest --cov=library --cov-report=html --cov-report=term-missing
   ```

3. **Executar apenas testes de unidade**:
   ```bash
   cd django
   pytest -m unit
   ```

4. **Executar apenas testes de integração**:
   ```bash
   cd django
   pytest -m integration
   ```

5. **Executar arquivo específico**:
   ```bash
   cd django
   pytest tests/test_models.py -v
   pytest tests/test_views.py -v
   pytest tests/test_special_features.py -v
   ```

### Executar Testes End-to-End (Frontend)

1. **Preparar ambiente**:
   - Certifique-se que o backend Django esteja rodando: `python manage.py runserver 8000`
   - Certifique-se que o frontend esteja rodando: `npm run dev` (porta 5173)

2. **Executar todos os testes E2E**:
   ```bash
   cd frontend
   npm run test:e2e
   ```

3. **Executar testes em modo interativo**:
   ```bash
   cd frontend
   npm run test:e2e:ui
   ```

4. **Executar testes com interface gráfica**:
   ```bash
   cd frontend
   npm run test:e2e:headed
   ```

5. **Executar arquivo específico**:
   ```bash
   cd frontend
   npx playwright test tests/e2e/article-search.spec.ts
   npx playwright test tests/e2e/article-creation.spec.ts  
   npx playwright test tests/e2e/pdf-upload.spec.ts
   npx playwright test tests/e2e/subscription-system.spec.ts
   ```

## Resultados Esperados

### Cobertura de Testes (Meta: ≥70%)
- **Models**: 100% de cobertura (testa criação, validação, relacionamentos)
- **Views/APIs**: 85%+ de cobertura (testa todos endpoints CRUD)
- **Funcionalidades Especiais**: 80%+ (testa upload, parsing BibTeX)

### Testes End-to-End (4 testes principais)
1. ✅ **Navegação e Busca**: Testa busca por título, autor, navegação entre páginas
2. ✅ **Criação/Edição**: Testa formulários de artigo, validação, cancelamento
3. ✅ **Upload de PDFs**: Testa upload individual e bulk import com ZIP
4. ✅ **Sistema de Subscrições**: Testa criação, validação, duplicatas

## Relatórios de Cobertura

Após executar os testes com cobertura, você encontrará:
- **HTML Report**: `django/htmlcov/index.html` (abra no navegador)
- **Terminal Report**: Mostra linhas não cobertas diretamente no terminal

## Comandos Rápidos para Apresentação

```bash
# 1. Executar testes de unidade/integração com cobertura
cd django && pytest --cov=library --cov-report=html --cov-report=term-missing

# 2. Abrir relatório de cobertura
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
xdg-open htmlcov/index.html  # Linux

# 3. Executar testes E2E (certifique-se que servidores estão rodando)
cd frontend && npm run test:e2e:headed
```

## Estrutura de Dados para Testes

Os testes usam **Factory Boy** para gerar dados consistentes:
- **EventFactory**: Gera eventos/conferências
- **EditionFactory**: Gera edições de eventos
- **ArticleFactory**: Gera artigos com autores aleatórios
- **AuthorFactory**: Gera autores com nomes e emails
- **SubscriptionFactory**: Gera subscrições

## Troubleshooting

### Problemas Comuns

1. **Erro de banco**: Execute `python manage.py migrate` antes dos testes
2. **Porta ocupada**: Mude as portas no `playwright.config.ts` se necessário
3. **Testes E2E falhando**: Verifique se ambos servidores (Django + React) estão rodando
4. **Cobertura baixa**: Execute apenas testes relevantes com `-m unit` ou `-m integration`

### Configuração de Desenvolvimento

Para desenvolvimento contínuo dos testes:
```bash
# Django - watch mode
cd django && pytest --cov=library -f

# Playwright - debug mode  
cd frontend && npx playwright test --debug
```
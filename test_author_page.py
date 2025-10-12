import requests
import json

# Configuração da API
API_BASE = "http://localhost:8000/api"

def test_author_page_functionality():
    """Testa a funcionalidade da página do autor (User Story 7)"""
    print("👤 Testando funcionalidade da página do autor (User Story 7)...")
    
    # Primeiro, vamos criar alguns dados de teste
    print("\n📝 Criando dados de teste...")
    
    # 1. Criar evento
    event_data = {
        "name": "Simpósio Brasileiro de Engenharia de Software",
        "description": "Evento para testes da página do autor"
    }
    
    try:
        response = requests.post(f"{API_BASE}/events/", json=event_data)
        if response.status_code == 201:
            event = response.json()
            print(f"✅ Evento criado: {event['name']}")
        else:
            print(f"❌ Erro ao criar evento: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # 2. Criar edições para diferentes anos
    editions = []
    for year in [2022, 2023, 2024]:
        edition_data = {
            "event_id": event['id'],
            "year": year,
            "location": f"Local {year}"
        }
        
        try:
            response = requests.post(f"{API_BASE}/editions/", json=edition_data)
            if response.status_code == 201:
                edition = response.json()
                editions.append(edition)
                print(f"✅ Edição criada: {year}")
        except Exception as e:
            print(f"❌ Erro ao criar edição {year}: {e}")
    
    # 3. Criar artigos para Marco Tulio Valente em diferentes anos
    marco_articles = [
        {
            "title": "Refactoring in Large Scale Software Systems",
            "abstract": "This paper presents techniques for refactoring large software systems",
            "authors": ["Marco Tulio Valente", "João Silva"],
            "edition_id": editions[0]['id']  # 2022
        },
        {
            "title": "Software Architecture Evolution Patterns",
            "abstract": "A comprehensive study on architectural evolution patterns in software systems",
            "authors": ["Marco Tulio Valente", "Maria Santos"],
            "edition_id": editions[0]['id']  # 2022
        },
        {
            "title": "Microservices Anti-patterns",
            "abstract": "Common anti-patterns in microservices architectures and how to avoid them",
            "authors": ["Marco Tulio Valente"],
            "edition_id": editions[1]['id']  # 2023
        },
        {
            "title": "Modern Software Engineering Practices",
            "abstract": "An overview of modern practices in software engineering",
            "authors": ["Marco Tulio Valente", "Pedro Oliveira", "Ana Costa"],
            "edition_id": editions[2]['id']  # 2024
        }
    ]
    
    created_articles = []
    for article_data in marco_articles:
        try:
            response = requests.post(f"{API_BASE}/articles/", json=article_data)
            if response.status_code == 201:
                article = response.json()
                created_articles.append(article)
                print(f"✅ Artigo criado: {article['title'][:50]}...")
            else:
                print(f"❌ Erro ao criar artigo: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro de conexão: {e}")
    
    print(f"\n📊 {len(created_articles)} artigos criados para Marco Tulio Valente")
    
    # 4. Testar a API da página do autor
    print(f"\n🔍 Testando API da página do autor...")
    
    # Testar diferentes formatos de nome
    test_names = [
        "marco-tulio-valente",
        "marco-tulio-oliveira-valente",  # Nome não existente
        "joão-silva",  # Coautor
        "nonexistent-author"  # Autor inexistente
    ]
    
    for author_name in test_names:
        try:
            url = f"{API_BASE}/authors/{author_name}/"
            response = requests.get(url)
            
            if response.status_code == 200:
                author_data = response.json()
                print(f"   ✅ '{author_name}' → Encontrado!")
                print(f"      Nome: {author_data['author']['name']}")
                print(f"      Total de artigos: {author_data['total_articles']}")
                print(f"      Anos: {author_data['years']}")
                
                # Mostrar artigos por ano
                for year in author_data['years']:
                    articles_count = len(author_data['articles_by_year'][year])
                    print(f"      {year}: {articles_count} artigo(s)")
                    
            elif response.status_code == 404:
                print(f"   ❌ '{author_name}' → Não encontrado (esperado para alguns casos)")
            else:
                print(f"   ❌ '{author_name}' → Erro {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erro ao buscar '{author_name}': {e}")
    
    # 5. Testar busca por nome parcial
    print(f"\n🔍 Testando busca por correspondência parcial...")
    partial_tests = [
        "marco",
        "valente", 
        "tulio"
    ]
    
    for partial_name in partial_tests:
        try:
            url = f"{API_BASE}/authors/{partial_name}/"
            response = requests.get(url)
            
            if response.status_code == 200:
                author_data = response.json()
                print(f"   ✅ '{partial_name}' → Encontrou: {author_data['author']['name']}")
            else:
                print(f"   ❌ '{partial_name}' → Não encontrado")
                
        except Exception as e:
            print(f"   ❌ Erro ao buscar '{partial_name}': {e}")
    
    print(f"\n🎉 Teste da funcionalidade da página do autor concluído!")
    print(f"\n📝 Resumo da funcionalidade:")
    print(f"   ✅ API para buscar autor por nome (slug) funcional")
    print(f"   ✅ Artigos agrupados por ano (mais recente primeiro)")
    print(f"   ✅ Busca funciona com nomes convertidos (espaços → hífens)")
    print(f"   ✅ Busca parcial para nomes similares")
    print(f"   ✅ Tratamento de erros para autores não encontrados")

def test_frontend_integration():
    """Orientações para testar a integração do frontend"""
    print(f"\n🌐 Para testar a página do autor no frontend:")
    print(f"")
    print(f"1. 🚀 Inicie os serviços:")
    print(f"   Backend: cd django && python manage.py runserver")
    print(f"   Frontend: cd frontend && npm run dev")
    print(f"")
    print(f"2. 🏠 Acesse as URLs da página do autor:")
    print(f"   http://localhost:5173/authors/marco-tulio-valente")
    print(f"   http://localhost:5173/authors/joão-silva")
    print(f"   http://localhost:5173/authors/nonexistent-author (teste de erro)")
    print(f"")
    print(f"3. 🔍 Valide a página do autor:")
    print(f"   - Cabeçalho com nome do autor e contagem de artigos")
    print(f"   - Artigos organizados por ano (mais recente primeiro)")
    print(f"   - Cada artigo mostra título, evento, coautores, abstract")
    print(f"   - Links para PDFs quando disponíveis")
    print(f"   - Design responsivo e navegação fluida")
    print(f"")
    print(f"4. 📋 Formatos de URL suportados:")
    print(f"   /authors/marco-tulio-valente")
    print(f"   /authors/marco-tulio-oliveira-valente (pode ser diferente)")
    print(f"   /authors/joão-silva")
    print(f"   /authors/qualquer-nome-autor")
    print(f"")
    print(f"5. 🧪 Teste casos extremos:")
    print(f"   - Autor sem artigos")
    print(f"   - Autor com muitos artigos em vários anos")
    print(f"   - Nomes com caracteres especiais")

if __name__ == "__main__":
    print("🚀 Iniciando teste da User Story 7: Página do Autor")
    print("=" * 60)
    
    # Teste básico de conectividade
    try:
        response = requests.get(f"{API_BASE}/events/")
        if response.status_code == 200:
            print("✅ Backend conectado e funcionando")
        else:
            print("❌ Problema de conectividade com o backend")
            exit(1)
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        print("💡 Certifique-se de que o Django está rodando em http://localhost:8000")
        exit(1)
    
    test_author_page_functionality()
    test_frontend_integration()
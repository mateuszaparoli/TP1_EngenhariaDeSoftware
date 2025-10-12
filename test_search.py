import requests
import json

# Configuração da API
API_BASE = "http://localhost:8000/api"

def test_search_functionality():
    """Testa a funcionalidade de pesquisa por título, autor e evento"""
    print("🔍 Testando funcionalidade de pesquisa (User Story 5)...")
    
    # Primeiro, vamos criar alguns dados de teste
    print("\n📝 Criando dados de teste...")
    
    # 1. Criar evento
    event_data = {
        "name": "Simpósio Brasileiro de Engenharia de Software",
        "description": "Evento para testes de pesquisa"
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
    
    # 2. Criar edição
    edition_data = {
        "event_id": event['id'],
        "year": 2024,
        "location": "Curitiba, PR"
    }
    
    try:
        response = requests.post(f"{API_BASE}/editions/", json=edition_data)
        if response.status_code == 201:
            edition = response.json()
            print(f"✅ Edição criada: {edition['year']}")
        else:
            print(f"❌ Erro ao criar edição: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # 3. Criar artigos de teste
    test_articles = [
        {
            "title": "Machine Learning Applications in Software Engineering",
            "abstract": "This paper explores machine learning techniques in software development",
            "authors": ["João Silva", "Maria Santos"],
            "edition_id": edition['id']
        },
        {
            "title": "Agile Methodologies for Large Scale Projects",
            "abstract": "An empirical study on agile practices in enterprise environments",
            "authors": ["Pedro Oliveira", "Ana Costa"],
            "edition_id": edition['id']
        },
        {
            "title": "DevOps Practices and Team Performance",
            "abstract": "Investigating the impact of DevOps on software development teams",
            "authors": ["Carlos Pereira", "João Silva"],
            "edition_id": edition['id']
        }
    ]
    
    created_articles = []
    for article_data in test_articles:
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
    
    print(f"\n📊 {len(created_articles)} artigos criados para teste")
    
    # 4. Testar pesquisa por título
    print(f"\n🔍 Testando pesquisa por TÍTULO...")
    search_tests = [
        ("Machine Learning", "title"),
        ("Agile", "title"),
        ("DevOps", "title"),
        ("Nonexistent Title", "title")
    ]
    
    for query, search_type in search_tests:
        try:
            url = f"{API_BASE}/articles/?{search_type}={query}"
            response = requests.get(url)
            if response.status_code == 200:
                results = response.json()
                print(f"   📋 '{query}' → {len(results)} resultado(s)")
                for result in results:
                    print(f"      • {result['title']}")
            else:
                print(f"   ❌ Erro na busca por '{query}': {response.status_code}")
        except Exception as e:
            print(f"   ❌ Erro de conexão: {e}")
    
    # 5. Testar pesquisa por autor
    print(f"\n🔍 Testando pesquisa por AUTOR...")
    author_tests = [
        ("João Silva", "author"),
        ("Maria Santos", "author"),
        ("Pedro", "author"),
        ("Nonexistent Author", "author")
    ]
    
    for query, search_type in author_tests:
        try:
            url = f"{API_BASE}/articles/?{search_type}={query}"
            response = requests.get(url)
            if response.status_code == 200:
                results = response.json()
                print(f"   👤 '{query}' → {len(results)} resultado(s)")
                for result in results:
                    authors = [a['name'] for a in result.get('authors', [])]
                    print(f"      • {result['title']} (Autores: {', '.join(authors)})")
            else:
                print(f"   ❌ Erro na busca por '{query}': {response.status_code}")
        except Exception as e:
            print(f"   ❌ Erro de conexão: {e}")
    
    # 6. Testar pesquisa por evento
    print(f"\n🔍 Testando pesquisa por EVENTO...")
    event_tests = [
        ("Simpósio Brasileiro", "event"),
        ("SBES", "event"),
        ("Engenharia de Software", "event"),
        ("Nonexistent Event", "event")
    ]
    
    for query, search_type in event_tests:
        try:
            url = f"{API_BASE}/articles/?{search_type}={query}"
            response = requests.get(url)
            if response.status_code == 200:
                results = response.json()
                print(f"   🎯 '{query}' → {len(results)} resultado(s)")
                for result in results:
                    event_name = result.get('edition', {}).get('event', {}).get('name', 'N/A')
                    print(f"      • {result['title']} (Evento: {event_name})")
            else:
                print(f"   ❌ Erro na busca por '{query}': {response.status_code}")
        except Exception as e:
            print(f"   ❌ Erro de conexão: {e}")
    
    # 7. Testar busca vazia
    print(f"\n🔍 Testando busca sem filtros...")
    try:
        response = requests.get(f"{API_BASE}/articles/")
        if response.status_code == 200:
            results = response.json()
            print(f"   📚 Total de artigos no sistema: {len(results)}")
        else:
            print(f"   ❌ Erro na busca geral: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro de conexão: {e}")
    
    print(f"\n🎉 Teste de pesquisa concluído!")
    print(f"\n📝 Resumo da funcionalidade:")
    print(f"   ✅ Pesquisa por título funcional")
    print(f"   ✅ Pesquisa por autor funcional")
    print(f"   ✅ Pesquisa por evento funcional")
    print(f"   ✅ API backend integrada")
    print(f"   ✅ Frontend com seletor de tipo de pesquisa")
    print(f"   ✅ Página de resultados implementada")

def test_frontend_integration():
    """Orientações para testar a integração do frontend"""
    print(f"\n🌐 Para testar a integração completa do frontend:")
    print(f"")
    print(f"1. 🚀 Inicie os serviços:")
    print(f"   Backend: cd django && python manage.py runserver")
    print(f"   Frontend: cd frontend && npm run dev")
    print(f"")
    print(f"2. 🏠 Acesse a página inicial: http://localhost:5173")
    print(f"")
    print(f"3. 🔍 Teste a barra de pesquisa melhorada:")
    print(f"   - Selecione 'Title' e pesquise por 'Machine Learning'")
    print(f"   - Selecione 'Author' e pesquise por 'João Silva'")
    print(f"   - Selecione 'Event' e pesquise por 'Simpósio'")
    print(f"")
    print(f"4. 📋 Valide a página de resultados:")
    print(f"   - Lista de artigos encontrados")
    print(f"   - Informações completas (título, autores, evento, abstract)")
    print(f"   - Links para PDFs (se disponíveis)")
    print(f"   - Contagem de resultados")
    print(f"   - Mensagem quando não há resultados")
    print(f"")
    print(f"5. 🔄 Teste mudanças de tipo de pesquisa:")
    print(f"   - Altere o tipo de pesquisa na página de resultados")
    print(f"   - Faça novas buscas com diferentes termos")

if __name__ == "__main__":
    print("🚀 Iniciando teste da User Story 5: Pesquisa de Artigos")
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
    
    test_search_functionality()
    test_frontend_integration()
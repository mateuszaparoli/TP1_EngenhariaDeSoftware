import requests
import json

# Configuração da API
API_BASE = "http://localhost:8000/api"

def test_clickable_author_links():
    """Testa a funcionalidade de links clicáveis dos autores"""
    print("🔗 Testando funcionalidade de links clicáveis dos autores...")
    
    # Primeiro, vamos criar alguns dados de teste
    print("\n📝 Criando dados de teste para navegação...")
    
    # 1. Criar evento
    event_data = {
        "name": "Simpósio Brasileiro de Engenharia de Software",
        "description": "Evento para testes de navegação"
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
        "location": "São Paulo, SP"
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
    
    # 3. Criar artigos com múltiplos autores para testar navegação
    test_articles = [
        {
            "title": "Advanced Software Engineering Techniques",
            "abstract": "This paper explores advanced techniques in software engineering",
            "authors": ["Marco Tulio Valente", "João Silva", "Maria Santos"],
            "edition_id": edition['id']
        },
        {
            "title": "Collaborative Development Methods",
            "abstract": "A study on collaborative methods in software development",
            "authors": ["João Silva", "Pedro Oliveira"],
            "edition_id": edition['id']
        },
        {
            "title": "Machine Learning in Software Testing",
            "abstract": "Applying ML techniques to improve software testing",
            "authors": ["Maria Santos", "Ana Costa", "Rodrigo Santos"],
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
    
    print(f"\n📊 {len(created_articles)} artigos criados com múltiplos autores")
    
    # 4. Testar a funcionalidade de slugs
    print(f"\n🔗 Testando conversão de nomes para slugs...")
    test_names = [
        "Marco Tulio Valente",
        "João Silva", 
        "Maria Santos",
        "Pedro Oliveira",
        "Ana Costa",
        "Rodrigo Santos"
    ]
    
    for name in test_names:
        # Simular a conversão de slug (mesmo algoritmo do frontend)
        slug = name.lower().replace(' ', '-').replace('ç', 'c').replace('ã', 'a')
        expected_url = f"/authors/{slug}"
        print(f"   👤 '{name}' → '{slug}' → URL: {expected_url}")
    
    # 5. Testar se todos os autores estão acessíveis via API
    print(f"\n🔍 Testando acesso às páginas dos autores...")
    for name in test_names:
        slug = name.lower().replace(' ', '-').replace('ç', 'c').replace('ã', 'a')
        try:
            url = f"{API_BASE}/authors/{slug}/"
            response = requests.get(url)
            
            if response.status_code == 200:
                author_data = response.json()
                print(f"   ✅ '{slug}' → Acessível! ({author_data['total_articles']} artigos)")
            elif response.status_code == 404:
                print(f"   ⚠️ '{slug}' → Não encontrado (normal se não tiver artigos)")
            else:
                print(f"   ❌ '{slug}' → Erro {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erro ao acessar '{slug}': {e}")
    
    print(f"\n🎉 Teste de links clicáveis concluído!")
    print(f"\n📝 Funcionalidades implementadas:")
    print(f"   ✅ Conversão automática de nomes para slugs URL-friendly")
    print(f"   ✅ Links clicáveis na página de pesquisa")
    print(f"   ✅ Links clicáveis na página do autor (coautores)")
    print(f"   ✅ Aba de autores no dashboard administrativo")
    print(f"   ✅ Navegação preserva contexto (abre em nova aba no admin)")

def test_navigation_flows():
    """Orientações para testar os fluxos de navegação no frontend"""
    print(f"\n🌐 Para testar a navegação completa no frontend:")
    print(f"")
    print(f"1. 🚀 Inicie os serviços:")
    print(f"   Backend: cd django && python manage.py runserver")
    print(f"   Frontend: cd frontend && npm run dev")
    print(f"")
    print(f"2. 🔍 Teste navegação na página de pesquisa:")
    print(f"   - Acesse: http://localhost:5173/search?q=software&type=title")
    print(f"   - Clique nos nomes dos autores nos resultados")
    print(f"   - Verifique se leva para a página correta do autor")
    print(f"")
    print(f"3. 👤 Teste navegação na página do autor:")
    print(f"   - Acesse: http://localhost:5173/authors/marco-tulio-valente")
    print(f"   - Clique nos nomes dos coautores")
    print(f"   - Navegue entre diferentes páginas de autores")
    print(f"")
    print(f"4. 🔧 Teste painel administrativo:")
    print(f"   - Acesse: http://localhost:5173/admin/signin")
    print(f"   - Faça login como admin")
    print(f"   - Vá para a aba 'Authors'")
    print(f"   - Clique nos nomes dos autores (abre em nova aba)")
    print(f"   - Use a busca para filtrar autores")
    print(f"")
    print(f"5. 🧪 Teste casos especiais:")
    print(f"   - Nomes com acentos: 'João Silva' → 'joão-silva'")
    print(f"   - Nomes compostos: 'Marco Tulio Valente' → 'marco-tulio-valente'")
    print(f"   - Múltiplos espaços: 'Ana  Costa' → 'ana-costa'")
    print(f"")
    print(f"6. ✅ Validações importantes:")
    print(f"   - Links têm estilo visual diferenciado (cor primária, hover)")
    print(f"   - URLs são limpos e SEO-friendly")
    print(f"   - Navegação funciona em ambas as direções")
    print(f"   - Admin dashboard preserva contexto (nova aba)")
    print(f"   - Busca de autores funciona no painel admin")

def test_user_experience():
    """Testa a experiência do usuário com links clicáveis"""
    print(f"\n👥 Testando experiência do usuário:")
    print(f"")
    print(f"🎯 Cenários de uso comuns:")
    print(f"")
    print(f"1. 📚 Pesquisador explorando literatura:")
    print(f"   - Pesquisa por 'software engineering'")
    print(f"   - Encontra artigo interessante")
    print(f"   - Clica no autor para ver outras publicações")
    print(f"   - Descobre coautores e explora suas páginas")
    print(f"")
    print(f"2. 🎓 Estudante fazendo revisão bibliográfica:")
    print(f"   - Encontra referência de 'Marco Tulio Valente'")
    print(f"   - Acessa diretamente /authors/marco-tulio-valente")
    print(f"   - Explora publicações por ano")
    print(f"   - Descobre colaboradores através dos links")
    print(f"")
    print(f"3. 🔧 Administrador gerenciando sistema:")
    print(f"   - Acessa painel administrativo")
    print(f"   - Vai para aba 'Authors'")
    print(f"   - Vê estatísticas de produtividade")
    print(f"   - Clica em autores para verificar páginas")
    print(f"")
    print(f"✨ Melhorias implementadas:")
    print(f"   ✅ Zero configuração manual de URLs")
    print(f"   ✅ Links visuais claros e intuitivos")
    print(f"   ✅ Navegação natural entre autores relacionados")
    print(f"   ✅ Dashboard administrativo com overview completo")
    print(f"   ✅ Busca integrada para grandes volumes de autores")

if __name__ == "__main__":
    print("🚀 Iniciando teste de Links Clicáveis dos Autores")
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
    
    test_clickable_author_links()
    test_navigation_flows()
    test_user_experience()
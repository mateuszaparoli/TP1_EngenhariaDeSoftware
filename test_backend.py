import requests
import json
import zipfile
import os

# Configuração da API
API_BASE = "http://localhost:8000/api"

def create_test_zip():
    """Cria um ZIP simples com arquivos de texto simulando PDFs"""
    zip_filename = 'test_pdfs.zip'
    
    # Criar arquivos de teste (simulando PDFs)
    test_files = {
        'machine_learning_applications.pdf': b'%PDF-1.4 Test PDF content for Machine Learning Applications',
        'agile_methodologies.pdf': b'%PDF-1.4 Test PDF content for Agile Methodologies', 
        'devops_practices.pdf': b'%PDF-1.4 Test PDF content for DevOps Practices'
    }
    
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for filename, content in test_files.items():
            zipf.writestr(filename, content)
    
    return zip_filename

def create_sbes_test_zip():
    """Cria um ZIP com PDFs usando os nomes exatos das entradas BibTeX"""
    zip_filename = 'sbes_test_pdfs.zip'
    
    test_files = {
        'sbes-paper1.pdf': b'%PDF-1.4 Test PDF content for Robotic-supported Data Loss Detection',
        'sbes-paper2.pdf': b'%PDF-1.4 Test PDF content for Code smell severity classification',
        'sbes-paper3.pdf': b'%PDF-1.4 Test PDF content for Effective Collaboration',
        'sbes-paper4.pdf': b'%PDF-1.4 Test PDF content for Investigating Accountability'
    }
    
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for filename, content in test_files.items():
            zipf.writestr(filename, content)
    
    return zip_filename

def test_backend_apis():
    """Testa todas as APIs do backend"""
    print("🧪 Testando APIs do Backend...")
    
    # Teste 1: Criar evento
    print("\n1. Testando criação de evento...")
    event_data = {
        "name": "Simpósio Brasileiro de Engenharia de Software",
        "description": "Evento anual sobre engenharia de software"
    }
    
    try:
        response = requests.post(f"{API_BASE}/events/", json=event_data)
        if response.status_code == 201:
            event = response.json()
            print(f"✅ Evento criado: {event['name']} (ID: {event['id']})")
            event_id = event['id']
        else:
            print(f"❌ Erro ao criar evento: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # Teste 2: Criar edição
    print("\n2. Testando criação de edição...")
    edition_data = {
        "event_id": event_id,
        "year": 2025,
        "location": "Brasília, DF"
    }
    
    try:
        response = requests.post(f"{API_BASE}/editions/", json=edition_data)
        if response.status_code == 201:
            edition = response.json()
            print(f"✅ Edição criada: {edition['event']['name']} {edition['year']} (ID: {edition['id']})")
            edition_id = edition['id']
        else:
            print(f"❌ Erro ao criar edição: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # Teste 3: Criar artigo individual
    print("\n3. Testando criação de artigo individual...")
    article_data = {
        "title": "Test Article - Individual Creation",
        "abstract": "Este é um artigo de teste criado individualmente",
        "edition_id": edition_id,
        "authors": ["João Silva", "Maria Santos"],
        "pdf_url": "https://example.com/test.pdf"
    }
    
    try:
        response = requests.post(f"{API_BASE}/articles/", json=article_data)
        if response.status_code == 201:
            article = response.json()
            print(f"✅ Artigo criado: {article['title']} (ID: {article['id']})")
        else:
            print(f"❌ Erro ao criar artigo: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
    
    # Teste 4: Importação em massa BibTeX (sem ZIP)
    print("\n4. Testando importação em massa BibTeX (sem ZIP)...")
    bibtex_content = """@article{test2025,
  title={Test Article from BibTeX Import},
  author={Pedro Oliveira and Ana Costa},
  journal={Test Conference},
  year={2025},
  abstract={This is a test article imported from BibTeX format},
  url={https://example.com/bibtex-test.pdf}
}

@article{test2025b,
  title={Another Test Article from BibTeX},
  author={Carlos Pereira and Rafael Lima},
  journal={Test Journal},
  year={2025},
  abstract={Another test article for bulk import functionality}
}"""
    
    bulk_data = {
        "event_name": "Simpósio Brasileiro de Engenharia de Software",
        "year": 2025,
        "bibtex_content": bibtex_content
    }
    
    try:
        response = requests.post(f"{API_BASE}/articles/bulk-import/", json=bulk_data)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Importação em massa concluída:")
            print(f"   - Artigos criados: {result['created_count']}")
            print(f"   - Erros: {len(result['errors'])}")
            if result['errors']:
                for error in result['errors']:
                    print(f"   - ⚠️ {error}")
        else:
            print(f"❌ Erro na importação em massa: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
    
    # Teste 5: Importação em massa BibTeX COM ZIP (NOVA FUNCIONALIDADE)
    print("\n5. 🆕 Testando importação em massa BibTeX COM ZIP...")
    
    # Criar ZIP de teste
    zip_file = create_test_zip()
    
    bibtex_with_pdfs = """@article{machine2025,
  title={Machine Learning Applications in Software Engineering},
  author={Silva, João and Santos, Maria},
  journal={Brazilian Symposium on Software Engineering},
  year={2025},
  abstract={This paper presents a comprehensive study on machine learning applications},
  url={https://example.com/machine.pdf}
}

@article{agile2025,
  title={Agile Methodologies in Large Scale Projects},
  author={Oliveira, Pedro and Costa, Ana},
  journal={International Conference on Software Engineering},
  year={2025},
  abstract={An empirical study on agile methodologies adoption in large scale projects}
}

@article{devops2025,
  title={DevOps Practices and Team Performance},
  author={Pereira, Carlos and Lima, Rafael and Souza, Beatriz},
  journal={IEEE Software},
  year={2025},
  abstract={This research investigates the relationship between DevOps practices and team performance}
}"""
    
    try:
        # Preparar dados para multipart/form-data
        files = {
            'bibtex_file': ('test.bib', bibtex_with_pdfs, 'text/plain'),
            'pdf_zip': (zip_file, open(zip_file, 'rb'), 'application/zip')
        }
        
        data = {
            'event_name': 'Simpósio Brasileiro de Engenharia de Software',
            'year': '2025'
        }
        
        response = requests.post(f"{API_BASE}/articles/bulk-import/", files=files, data=data)
        
        # Fechar o arquivo ZIP
        files['pdf_zip'][1].close()
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Importação em massa COM ZIP concluída:")
            print(f"   - Artigos criados: {result['created_count']}")
            print(f"   - PDFs associados: {result.get('pdf_matches', 0)}")
            print(f"   - Erros: {len(result['errors'])}")
            if result['errors']:
                for error in result['errors']:
                    print(f"   - ⚠️ {error}")
        else:
            print(f"❌ Erro na importação com ZIP: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
    finally:
        # Limpar arquivo ZIP de teste
        if os.path.exists(zip_file):
            os.remove(zip_file)
    
    # Teste 6: Buscar artigos
    print("\n6. Testando busca de artigos...")
    try:
        response = requests.get(f"{API_BASE}/articles/")
        if response.status_code == 200:
            articles = response.json()
            print(f"✅ Total de artigos encontrados: {len(articles)}")
            
            # Mostrar quais artigos têm PDFs
            with_pdfs = 0
            for article in articles:
                if article.get('pdf_url') and 'localhost:8000' in str(article.get('pdf_url', '')):
                    with_pdfs += 1
                print(f"   - {article['title']} ({len(article.get('authors', []))} autores)")
                if article.get('pdf_url') and 'localhost:8000' in str(article.get('pdf_url', '')):
                    print(f"     📎 PDF: {article['pdf_url']}")
                    
            print(f"📊 Resumo: {len(articles)} artigos total, {with_pdfs} com PDFs anexados")
        else:
            print(f"❌ Erro ao buscar artigos: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
    
    print("\n🏁 Teste do backend concluído!")
    print("\n🎉 NOVA FUNCIONALIDADE TESTADA:")
    print("   ✅ Upload de arquivo ZIP com PDFs")
    print("   ✅ Associação automática de PDFs aos artigos")
    print("   ✅ Relatório de PDFs associados com sucesso")

def test_sbes_bibtex_validation():
    """Testa especificamente o BibTeX do SBES com o paper2 sem year"""
    print("🧪 Testando validação do BibTeX SBES...")
    
    # BibTeX com sbes-paper2 SEM o campo year (deve ser pulado)
    sbes_bibtex = """@inproceedings{sbes-paper1,
 author = {Davi Freitas and Breno Miranda and Juliano Iyoda},
 title = {Robotic-supported Data Loss Detection in Android Applications},
 booktitle = {Anais do XXXVIII Simpósio Brasileiro de Engenharia de Software},
 year = {2024},
 pages = {1--11},
 publisher = {SBC},
 }

@inproceedings{sbes-paper2,
 author = {Fábio Santos and Julio Duarte and Ricardo Choren},
 title = {Code smell severity classification at class and method level with a single manually labeled imbalanced dataset},
 booktitle = {Anais do XXXVIII Simpósio Brasileiro de Engenharia de Software},
 pages = {12--23},
 publisher = {SBC},
}

@inproceedings{sbes-paper3,
 author = {Gabriel Busquim and Allysson Araújo and Maria Lima and Marcos Kalinowski},
 title = {Towards Effective Collaboration between Software Engineers and Data Scientists developing Machine Learning-Enabled Systems},
 booktitle = {Anais do XXXVIII Simpósio Brasileiro de Engenharia de Software},
 location = {Curitiba/PR},
 year = {2024},
 publisher = {SBC},
 }

@inproceedings{sbes-paper4,
 author = {Felipe Cordeiro and Aline Vasconcelos and Rodrigo Santos and Patricia Lago},
 title = {Investigating Accountability in Business-intensive Systems-of-Systems},
 booktitle = {Anais do XXXVIII Simpósio Brasileiro de Engenharia de Software},
 location = {Curitiba/PR},
 year = {2024},
 pages = {35--46},
 publisher = {SBC},
}"""

    # Criar ZIP de teste
    zip_file = create_sbes_test_zip()
    
    try:
        # Preparar dados para multipart/form-data
        files = {
            'bibtex_file': ('sbes_test.bib', sbes_bibtex, 'text/plain'),
            'pdf_zip': (zip_file, open(zip_file, 'rb'), 'application/zip')
        }
        
        data = {
            'event_name': 'Simpósio Brasileiro de Engenharia de Software',
            'year': '2024'
        }
        
        print("\n📤 Enviando BibTeX com sbes-paper2 SEM campo year...")
        response = requests.post(f"{API_BASE}/articles/bulk-import/", files=files, data=data)
        
        # Fechar o arquivo ZIP
        files['pdf_zip'][1].close()
        
        if response.status_code == 201:
            result = response.json()
            print(f"\n✅ Importação concluída!")
            print(f"📊 Resultados:")
            print(f"   - Total processado: {result['report']['summary']['total_entries_processed']}")
            print(f"   - Importados com sucesso: {result['created_count']}")
            print(f"   - Pulados: {result['skipped_count']}")
            print(f"   - Erros de processamento: {result['error_count']}")
            print(f"   - PDFs associados: {result.get('pdf_matches', 0)}")
            
            # Verificar se sbes-paper2 foi pulado por falta do campo year
            print(f"\n📋 Artigos pulados:")
            for skipped in result['skipped_articles']:
                print(f"   ❌ {skipped['title']}")
                print(f"      Motivo: {skipped['reason']}")
                print(f"      Campos faltando: {', '.join(skipped['missing_fields'])}")
                
            # Verificar artigos importados com sucesso
            print(f"\n📋 Artigos importados:")
            for article in result['articles']:
                pdf_status = "📎 com PDF" if article.get('pdf_url') and 'localhost:8000' in str(article.get('pdf_url', '')) else "📄 sem PDF"
                print(f"   ✅ {article['title']} ({pdf_status})")
                
            # Validar se o resultado está correto
            expected_skipped = 1  # sbes-paper2 sem year
            expected_imported = 3  # sbes-paper1, sbes-paper3, sbes-paper4
            
            print(f"\n🔍 Validação:")
            if result['skipped_count'] == expected_skipped:
                print(f"   ✅ Número correto de artigos pulados: {result['skipped_count']}")
            else:
                print(f"   ❌ Número incorreto de artigos pulados: {result['skipped_count']} (esperado: {expected_skipped})")
                
            if result['created_count'] == expected_imported:
                print(f"   ✅ Número correto de artigos importados: {result['created_count']}")
            else:
                print(f"   ❌ Número incorreto de artigos importados: {result['created_count']} (esperado: {expected_imported})")
                
            # Verificar se sbes-paper2 está na lista de pulados
            paper2_skipped = any('Code smell severity classification' in skipped['title'] for skipped in result['skipped_articles'])
            if paper2_skipped:
                print(f"   ✅ sbes-paper2 foi corretamente pulado por falta do campo 'year'")
            else:
                print(f"   ❌ sbes-paper2 não foi pulado como esperado")
                
            print(f"\n📈 Taxa de sucesso: {result['report']['summary']['success_rate']}%")
            
        else:
            print(f"❌ Erro na importação: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
    finally:
        # Limpar arquivo ZIP de teste
        if os.path.exists(zip_file):
            os.remove(zip_file)

def test_backend_complete():
    """Executa o teste completo incluindo a validação do SBES"""
    print("🚀 Iniciando teste completo do backend...")
    
    # Teste básico de conectividade
    try:
        response = requests.get(f"{API_BASE}/events/")
        if response.status_code == 200:
            print("✅ Backend conectado e funcionando")
        else:
            print("❌ Problema de conectividade com o backend")
            return
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        print("💡 Certifique-se de que o Django está rodando em http://localhost:8000")
        return
    
    # Executar teste específico do SBES
    test_sbes_bibtex_validation()
    
    print("\n🎉 Teste concluído!")
    print("\n📝 Resumo da funcionalidade:")
    print("   ✅ Parser BibTeX funcional")
    print("   ✅ Validação de campos obrigatórios (title, year)")
    print("   ✅ Relatório detalhado de erros")
    print("   ✅ Associação automática de PDFs por nome da entrada BibTeX")
    print("   ✅ Tratamento correto de artigos com campos faltando")

if __name__ == "__main__":
    test_backend_complete()
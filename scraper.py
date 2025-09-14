#!/usr/bin/env python3
"""
ArXiv Scraper para Biblioteca Digital
Scraping de artigos do arXiv.org para diferentes casos de uso
Implementa User Stories 1-5
"""

import argparse
import requests
import xml.etree.ElementTree as ET
import csv
import json
import time
import os
from datetime import datetime, timedelta
from urllib.parse import urlencode
import sys
from typing import List, Dict, Optional
import re

class ArXivScraper:
    """Classe principal para scraping do arXiv"""
    
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
        self.delay = 3  # Delay entre requisições (recomendado pelo arXiv)
        
        # Principais categorias de CS e seus principais eventos de 2024
        self.cs_categories_events = {
            'cs.SE': ['ICSE', 'FSE'],  # Software Engineering
            'cs.AI': ['AAAI', 'IJCAI'],  # Artificial Intelligence
            'cs.DB': ['SIGMOD', 'VLDB'],  # Databases
            'cs.LG': ['ICML', 'NeurIPS'],  # Machine Learning
            'cs.CV': ['CVPR', 'ICCV'],  # Computer Vision
            'cs.CL': ['ACL', 'EMNLP'],  # Computational Linguistics
            'cs.CR': ['CCS', 'USENIX Security'],  # Cryptography and Security
            'cs.DC': ['PODC', 'DISC'],  # Distributed Computing
            'cs.DS': ['SODA', 'STOC'],  # Data Structures and Algorithms
            'cs.HC': ['CHI', 'UIST'],  # Human-Computer Interaction
            'cs.IR': ['SIGIR', 'WSDM'],  # Information Retrieval
            'cs.NI': ['SIGCOMM', 'INFOCOM'],  # Networking
            'cs.PL': ['PLDI', 'POPL'],  # Programming Languages
            'cs.GR': ['SIGGRAPH', 'Eurographics']  # Graphics
        }
        
    def search_papers(self, query: str, max_results: int = 100, start: int = 0) -> List[Dict]:
        """
        Busca artigos no arXiv com base em uma query
        
        Args:
            query: Query de busca (ex: "cat:cs.SE", "au:Smith", "ti:machine learning")
            max_results: Número máximo de resultados
            start: Índice de início (para paginação)
        """
        params = {
            'search_query': query,
            'start': start,
            'max_results': max_results,
            'sortBy': 'submittedDate',
            'sortOrder': 'descending'
        }
        
        url = f"{self.base_url}?{urlencode(params)}"
        
        try:
            print(f"Buscando: {query} (máx: {max_results})")
            response = requests.get(url)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            # Namespace do Atom
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            papers = []
            entries = root.findall('atom:entry', ns)
            
            for entry in entries:
                paper = self._extract_paper_info(entry, ns)
                if paper:
                    papers.append(paper)
                    
            print(f"✓ Encontrados {len(papers)} artigos")
            
            # Delay entre requisições
            time.sleep(self.delay)
            return papers
            
        except Exception as e:
            print(f"❌ Erro ao buscar artigos: {e}")
            return []
    
    def _extract_paper_info(self, entry, ns) -> Optional[Dict]:
        """Extrai informações de um artigo do XML"""
        try:
            # ID do arXiv
            id_elem = entry.find('atom:id', ns)
            arxiv_id = id_elem.text.split('/')[-1] if id_elem is not None else ""
            
            # Título
            title_elem = entry.find('atom:title', ns)
            title = title_elem.text.strip().replace('\n', ' ').replace('  ', ' ') if title_elem is not None else ""
            
            # Resumo
            summary_elem = entry.find('atom:summary', ns)
            abstract = summary_elem.text.strip().replace('\n', ' ').replace('  ', ' ') if summary_elem is not None else ""
            
            # Autores
            authors = []
            for author in entry.findall('atom:author', ns):
                name_elem = author.find('atom:name', ns)
                if name_elem is not None:
                    authors.append(name_elem.text.strip())
            
            # Data de publicação
            published_elem = entry.find('atom:published', ns)
            published_date = published_elem.text[:10] if published_elem is not None else ""
            
            # Data de atualização
            updated_elem = entry.find('atom:updated', ns)
            updated_date = updated_elem.text[:10] if updated_elem is not None else ""
            
            # Categorias
            categories = []
            for category in entry.findall('atom:category', ns):
                term = category.get('term')
                if term:
                    categories.append(term)
            
            # Links (PDF e página)
            pdf_url = ""
            page_url = ""
            for link in entry.findall('atom:link', ns):
                if link.get('type') == 'application/pdf':
                    pdf_url = link.get('href', '')
                elif link.get('type') == 'text/html':
                    page_url = link.get('href', '')
            
            # DOI (se disponível)
            doi = ""
            doi_elem = entry.find('arxiv:doi', ns)
            if doi_elem is not None:
                doi = doi_elem.text.strip()
            
            # Journal reference (se disponível)
            journal_ref = ""
            journal_elem = entry.find('arxiv:journal_ref', ns)
            if journal_elem is not None:
                journal_ref = journal_elem.text.strip()
            
            return {
                'arxiv_id': arxiv_id,
                'title': title,
                'authors': '; '.join(authors),
                'abstract': abstract,
                'published_date': published_date,
                'updated_date': updated_date,
                'categories': ', '.join(categories),
                'pdf_url': pdf_url,
                'page_url': page_url,
                'doi': doi,
                'journal_ref': journal_ref,
                'scraped_at': datetime.now().isoformat(),
                'event': '',  # Será preenchido quando aplicável
                'event_edition': ''  # Será preenchido quando aplicável
            }
            
        except Exception as e:
            print(f"❌ Erro ao extrair informações do artigo: {e}")
            return None
    
    # USER STORY 1: Cadastrar evento
    def create_event_config(self, event_name: str, description: str = "", categories: List[str] = None) -> Dict:
        """Cria configuração para um evento"""
        return {
            'name': event_name,
            'description': description,
            'categories': categories or [],
            'editions': [],
            'created_at': datetime.now().isoformat()
        }
    
    def save_event_config(self, event_config: Dict, filename: str = "events_config.json"):
        """Salva configuração de eventos em arquivo JSON"""
        events = []
        
        # Carrega eventos existentes
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    events = json.load(f)
            except:
                events = []
        
        # Adiciona ou atualiza evento
        event_exists = False
        for i, event in enumerate(events):
            if event['name'] == event_config['name']:
                events[i] = event_config
                event_exists = True
                break
        
        if not event_exists:
            events.append(event_config)
        
        # Salva
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Evento '{event_config['name']}' salvo em {filename}")
    
    # USER STORY 2: Cadastrar edição de evento
    def create_event_edition(self, event_name: str, year: int, location: str = "", 
                           start_date: str = "", end_date: str = "") -> Dict:
        """Cria configuração para uma edição de evento"""
        return {
            'year': year,
            'location': location,
            'start_date': start_date,
            'end_date': end_date,
            'created_at': datetime.now().isoformat()
        }
    
    def add_edition_to_event(self, event_name: str, edition_config: Dict, filename: str = "events_config.json"):
        """Adiciona edição a um evento existente"""
        events = []
        
        # Carrega eventos existentes
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    events = json.load(f)
            except:
                print(f"❌ Erro ao carregar {filename}")
                return
        
        # Encontra o evento e adiciona a edição
        event_found = False
        for event in events:
            if event['name'] == event_name:
                if 'editions' not in event:
                    event['editions'] = []
                event['editions'].append(edition_config)
                event_found = True
                break
        
        if not event_found:
            print(f"❌ Evento '{event_name}' não encontrado")
            return
        
        # Salva
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Edição {edition_config['year']} adicionada ao evento '{event_name}'")
    
    # USER STORY 3: Cadastrar artigo manualmente
    def scrape_single_paper(self, arxiv_id: str, event: str = "", event_edition: str = "") -> Optional[Dict]:
        """Busca um único artigo pelo ID do arXiv"""
        query = f"id:{arxiv_id}"
        papers = self.search_papers(query, max_results=1)
        
        if papers:
            paper = papers[0]
            if event:
                paper['event'] = event
            if event_edition:
                paper['event_edition'] = event_edition
            return paper
        return None
    
    # USER STORY 4: Cadastrar artigos em massa
    def scrape_papers_by_criteria(self, search_criteria: Dict, max_results: int = 100) -> List[Dict]:
        """
        Busca artigos em massa baseado em critérios
        search_criteria pode incluir: category, author, title, date_range, event, etc.
        """
        papers = []
        
        if 'category' in search_criteria:
            query = f"cat:{search_criteria['category']}"
            papers.extend(self.search_papers(query, max_results))
        
        elif 'author' in search_criteria:
            query = f"au:{search_criteria['author']}"
            papers.extend(self.search_papers(query, max_results))
        
        elif 'title_keywords' in search_criteria:
            query = f"ti:{search_criteria['title_keywords']}"
            papers.extend(self.search_papers(query, max_results))
        
        elif 'custom_query' in search_criteria:
            papers.extend(self.search_papers(search_criteria['custom_query'], max_results))
        
        # Adiciona informações de evento se fornecidas
        if 'event' in search_criteria or 'event_edition' in search_criteria:
            for paper in papers:
                if 'event' in search_criteria:
                    paper['event'] = search_criteria['event']
                if 'event_edition' in search_criteria:
                    paper['event_edition'] = search_criteria['event_edition']
        
        return papers
    
    # USER STORY 5: Pesquisar artigos
    def search_papers_by_title(self, title_keywords: str, max_results: int = 50) -> List[Dict]:
        """Pesquisa artigos por palavras-chave no título"""
        query = f"ti:{title_keywords}"
        return self.search_papers(query, max_results)
    
    def search_papers_by_author(self, author_name: str, max_results: int = 50) -> List[Dict]:
        """Pesquisa artigos por nome do autor"""
        query = f"au:{author_name}"
        return self.search_papers(query, max_results)
    
    def search_papers_by_event_keywords(self, event_keywords: str, max_results: int = 50) -> List[Dict]:
        """Pesquisa artigos que mencionem o evento no título ou resumo"""
        # Busca no título e abstract
        query = f"ti:{event_keywords} OR abs:{event_keywords}"
        return self.search_papers(query, max_results)
    
    # MODO PADRÃO: Coleta automática dos principais eventos
    def scrape_default_collection(self, papers_per_event: int = 10) -> List[Dict]:
        """
        Coleta artigos dos principais eventos de 2024 de cada categoria de CS
        10 artigos para cada um dos 2 maiores eventos de cada categoria
        """
        all_papers = []
        
        print("🚀 Iniciando coleta padrão dos principais eventos de CS 2024...")
        print(f"📊 Coletando {papers_per_event} artigos por evento")
        print(f"📂 Total de categorias: {len(self.cs_categories_events)}")
        
        for category, events in self.cs_categories_events.items():
            print(f"\n📁 Categoria: {category}")
            
            for event in events[:2]:  # Top 2 eventos por categoria
                print(f"  🎯 Evento: {event}")
                
                # Busca artigos relacionados ao evento na categoria
                search_queries = [
                    f"cat:{category} AND ti:{event}",
                    f"cat:{category} AND abs:{event}",
                    f"cat:{category}"  # Fallback para artigos da categoria
                ]
                
                papers_found = []
                
                for query in search_queries:
                    if len(papers_found) >= papers_per_event:
                        break
                    
                    papers = self.search_papers(query, papers_per_event)
                    
                    for paper in papers:
                        if len(papers_found) >= papers_per_event:
                            break
                        
                        # Evita duplicatas
                        if not any(p['arxiv_id'] == paper['arxiv_id'] for p in papers_found):
                            paper['event'] = event
                            paper['event_edition'] = '2024'
                            paper['category_source'] = category
                            papers_found.append(paper)
                
                print(f"    ✓ Coletados {len(papers_found)} artigos para {event}")
                all_papers.extend(papers_found)
        
        print(f"\n🎉 Coleta padrão concluída! Total: {len(all_papers)} artigos")
        return all_papers
    
    def save_to_csv(self, papers: List[Dict], filename: str):
        """Salva os artigos em um arquivo CSV"""
        if not papers:
            print("⚠️  Nenhum artigo para salvar.")
            return
            
        fieldnames = [
            'arxiv_id', 'title', 'authors', 'abstract', 'published_date', 
            'updated_date', 'categories', 'pdf_url', 'page_url', 'doi', 
            'journal_ref', 'event', 'event_edition', 'category_source', 'scraped_at'
        ]
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for paper in papers:
                    # Garante que todas as chaves existam
                    row = {field: paper.get(field, '') for field in fieldnames}
                    writer.writerow(row)
            
            print(f"✅ Salvos {len(papers)} artigos em {filename}")
            
        except Exception as e:
            print(f"❌ Erro ao salvar CSV: {e}")
    
    def save_to_json(self, papers: List[Dict], filename: str):
        """Salva os artigos em um arquivo JSON"""
        if not papers:
            print("⚠️  Nenhum artigo para salvar.")
            return
        
        try:
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(papers, jsonfile, indent=2, ensure_ascii=False)
            
            print(f"✅ Salvos {len(papers)} artigos em {filename}")
            
        except Exception as e:
            print(f"❌ Erro ao salvar JSON: {e}")

def main():
    parser = argparse.ArgumentParser(
        description='ArXiv Scraper para Biblioteca Digital - User Stories 1-5',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:

# Modo padrão (coleta automática dos principais eventos de 2024)
python arxiv_scraper.py

# User Story 1 & 2: Gerenciar eventos
python arxiv_scraper.py event --create --name "ICSE" --description "International Conference on Software Engineering" --categories "cs.SE"
python arxiv_scraper.py edition --event "ICSE" --year 2024 --location "Lisbon, Portugal"

# User Story 3: Cadastrar artigo único
python arxiv_scraper.py single --arxiv-id "2301.12345" --event "ICSE" --edition "2024"

# User Story 4: Cadastro em massa
python arxiv_scraper.py bulk --category "cs.SE" --max-results 100 --event "ICSE" --edition "2024"

# User Story 5: Pesquisar artigos
python arxiv_scraper.py search --title "machine learning" --max-results 50
python arxiv_scraper.py search --author "John Smith" --max-results 30
python arxiv_scraper.py search --event "SIGMOD" --max-results 40
        """
    )
    
    # Subcomandos
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')
    
    # Comando para eventos (US 1)
    event_parser = subparsers.add_parser('event', help='Gerenciar eventos')
    event_parser.add_argument('--create', action='store_true', help='Criar novo evento')
    event_parser.add_argument('--name', required=True, help='Nome do evento')
    event_parser.add_argument('--description', default='', help='Descrição do evento')
    event_parser.add_argument('--categories', nargs='+', default=[], help='Categorias do arXiv relacionadas')
    
    # Comando para edições (US 2)
    edition_parser = subparsers.add_parser('edition', help='Gerenciar edições de eventos')
    edition_parser.add_argument('--event', required=True, help='Nome do evento')
    edition_parser.add_argument('--year', type=int, required=True, help='Ano da edição')
    edition_parser.add_argument('--location', default='', help='Local da edição')
    edition_parser.add_argument('--start-date', default='', help='Data de início (YYYY-MM-DD)')
    edition_parser.add_argument('--end-date', default='', help='Data de fim (YYYY-MM-DD)')
    
    # Comando para artigo único (US 3)
    single_parser = subparsers.add_parser('single', help='Cadastrar artigo único')
    single_parser.add_argument('--arxiv-id', required=True, help='ID do arXiv')
    single_parser.add_argument('--event', default='', help='Nome do evento')
    single_parser.add_argument('--edition', default='', help='Edição do evento')
    single_parser.add_argument('--output', default='single_paper.csv', help='Arquivo de saída')
    
    # Comando para cadastro em massa (US 4)
    bulk_parser = subparsers.add_parser('bulk', help='Cadastrar artigos em massa')
    bulk_parser.add_argument('--category', help='Categoria do arXiv')
    bulk_parser.add_argument('--author', help='Nome do autor')
    bulk_parser.add_argument('--title-keywords', help='Palavras-chave no título')
    bulk_parser.add_argument('--custom-query', help='Query personalizada')
    bulk_parser.add_argument('--max-results', type=int, default=100, help='Máximo de resultados')
    bulk_parser.add_argument('--event', default='', help='Nome do evento')
    bulk_parser.add_argument('--edition', default='', help='Edição do evento')
    bulk_parser.add_argument('--output', default='bulk_papers.csv', help='Arquivo de saída')
    bulk_parser.add_argument('--format', choices=['csv', 'json'], default='csv', help='Formato de saída')
    
    # Comando para pesquisa (US 5)
    search_parser = subparsers.add_parser('search', help='Pesquisar artigos')
    search_parser.add_argument('--title', help='Pesquisar por título')
    search_parser.add_argument('--author', help='Pesquisar por autor')
    search_parser.add_argument('--event', help='Pesquisar por evento')
    search_parser.add_argument('--max-results', type=int, default=50, help='Máximo de resultados')
    search_parser.add_argument('--output', default='search_results.csv', help='Arquivo de saída')
    search_parser.add_argument('--format', choices=['csv', 'json'], default='csv', help='Formato de saída')
    
    # Argumentos gerais
    parser.add_argument('--papers-per-event', type=int, default=10, 
                       help='Artigos por evento no modo padrão (padrão: 10)')
    parser.add_argument('--output-default', default='default_collection.csv',
                       help='Arquivo de saída para modo padrão')
    
    args = parser.parse_args()
    
    scraper = ArXivScraper()
    
    try:
        # Modo padrão (sem comando específico)
        if not args.command:
            print("🎯 Executando coleta padrão...")
            papers = scraper.scrape_default_collection(args.papers_per_event)
            scraper.save_to_csv(papers, args.output_default)
        
        # User Story 1: Gerenciar eventos
        elif args.command == 'event':
            if args.create:
                event_config = scraper.create_event_config(
                    args.name, args.description, args.categories
                )
                scraper.save_event_config(event_config)
        
        # User Story 2: Gerenciar edições
        elif args.command == 'edition':
            edition_config = scraper.create_event_edition(
                args.event, args.year, args.location, args.start_date, args.end_date
            )
            scraper.add_edition_to_event(args.event, edition_config)
        
        # User Story 3: Artigo único
        elif args.command == 'single':
            paper = scraper.scrape_single_paper(args.arxiv_id, args.event, args.edition)
            if paper:
                scraper.save_to_csv([paper], args.output)
            else:
                print(f"❌ Artigo {args.arxiv_id} não encontrado")
        
        # User Story 4: Cadastro em massa
        elif args.command == 'bulk':
            criteria = {}
            
            if args.category:
                criteria['category'] = args.category
            elif args.author:
                criteria['author'] = args.author
            elif args.title_keywords:
                criteria['title_keywords'] = args.title_keywords
            elif args.custom_query:
                criteria['custom_query'] = args.custom_query
            else:
                print("❌ É necessário especificar pelo menos um critério de busca")
                sys.exit(1)
            
            if args.event:
                criteria['event'] = args.event
            if args.edition:
                criteria['event_edition'] = args.edition
            
            papers = scraper.scrape_papers_by_criteria(criteria, args.max_results)
            
            if args.format == 'json':
                scraper.save_to_json(papers, args.output)
            else:
                scraper.save_to_csv(papers, args.output)
        
        # User Story 5: Pesquisa
        elif args.command == 'search':
            papers = []
            
            if args.title:
                papers = scraper.search_papers_by_title(args.title, args.max_results)
            elif args.author:
                papers = scraper.search_papers_by_author(args.author, args.max_results)
            elif args.event:
                papers = scraper.search_papers_by_event_keywords(args.event, args.max_results)
            else:
                print("❌ É necessário especificar título, autor ou evento para pesquisa")
                sys.exit(1)
            
            if args.format == 'json':
                scraper.save_to_json(papers, args.output)
            else:
                scraper.save_to_csv(papers, args.output)
            
    except KeyboardInterrupt:
        print("\n🛑 Operação interrompida pelo usuário.")
    except Exception as e:
        print(f"❌ Erro durante a execução: {e}")

if __name__ == "__main__":
    main()

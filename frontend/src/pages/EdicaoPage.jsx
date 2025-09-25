import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const EdicaoPage = () => {
  const { slug, ano } = useParams();
  const [edicao, setEdicao] = useState(null);
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEdicaoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados da edição específica
        const edicaoData = await apiService.get(`/events/${slug}/${ano}`);
        setEdicao(edicaoData);
        
        // Os artigos podem vir junto com os dados da edição
        if (edicaoData.artigos) {
          setArtigos(edicaoData.artigos);
        }
        
      } catch (err) {
        console.error('Erro ao buscar dados da edição:', err);
        setError('Erro ao carregar dados da edição');
        
        // Dados mock para desenvolvimento/teste
        setEdicao({
          nome: `${slug.toUpperCase()} ${ano}`,
          slug: slug,
          ano: ano,
          dataEvento: `15 de outubro de ${ano}`,
          local: 'Universidade Federal do Brasil',
          descricao: 'Descrição da edição será carregada da API'
        });
        
        setArtigos([
          {
            id: 1,
            titulo: 'Arquitetura de Microsserviços em Sistemas Distribuídos',
            autores: ['João Silva', 'Maria Santos'],
            paginas: '1-12',
            palavrasChave: ['microsserviços', 'sistemas distribuídos', 'arquitetura']
          },
          {
            id: 2,
            titulo: 'Machine Learning aplicado à Análise de Sentimentos',
            autores: ['Pedro Costa', 'Ana Oliveira', 'Carlos Mendes'],
            paginas: '13-28',
            palavrasChave: ['machine learning', 'análise de sentimentos', 'processamento de linguagem natural']
          },
          {
            id: 3,
            titulo: 'Blockchain e Contratos Inteligentes: Uma Análise Comparativa',
            autores: ['Fernanda Lima'],
            paginas: '29-45',
            palavrasChave: ['blockchain', 'contratos inteligentes', 'criptografia']
          },
          {
            id: 4,
            titulo: 'Desenvolvimento Ágil com DevOps: Práticas e Ferramentas',
            autores: ['Roberto Ferreira', 'Luciana Rodrigues'],
            paginas: '46-62',
            palavrasChave: ['devops', 'desenvolvimento ágil', 'automação']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (slug && ano) {
      fetchEdicaoData();
    }
  }, [slug, ano]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Carregando...</h2>
        <p>Buscando dados da edição...</p>
      </div>
    );
  }

  if (error && !edicao) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>Erro</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <Link to={`/eventos/${slug}`} style={{ color: '#007bff', textDecoration: 'none' }}>
          {slug.toUpperCase()}
        </Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span>{ano}</span>
      </nav>

      {/* Header da Edição */}
      <header style={{ marginBottom: '3rem' }}>
        <h1>{edicao?.nome || `${slug.toUpperCase()} ${ano}`}</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          {edicao?.dataEvento && (
            <div>
              <strong>Data do Evento:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{edicao.dataEvento}</p>
            </div>
          )}
          
          {edicao?.local && (
            <div>
              <strong>Local:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{edicao.local}</p>
            </div>
          )}
          
          <div>
            <strong>Total de Artigos:</strong>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{artigos.length} artigos publicados</p>
          </div>
        </div>

        {edicao?.descricao && (
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1.5rem' }}>
            {edicao.descricao}
          </p>
        )}
      </header>

      {/* Lista de Artigos */}
      <section>
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          Artigos Publicados
        </h2>
        
        {artigos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {artigos.map((artigo, index) => (
              <article 
                key={artigo.id || index}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '2rem',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  lineHeight: '1.4'
                }}>
                  {artigo.titulo}
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '2rem',
                  marginBottom: '1rem'
                }}>
                  {artigo.autores && artigo.autores.length > 0 && (
                    <div>
                      <strong style={{ color: '#495057' }}>Autores:</strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                        {artigo.autores.map((autor, idx) => (
                          <span key={idx}>
                            <Link 
                              to={`/autor/${autor.toLowerCase().replace(/\s+/g, '-')}`}
                              style={{ color: '#007bff', textDecoration: 'none' }}
                            >
                              {autor}
                            </Link>
                            {idx < artigo.autores.length - 1 && ', '}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  
                  {artigo.paginas && (
                    <div>
                      <strong style={{ color: '#495057' }}>Páginas:</strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{artigo.paginas}</p>
                    </div>
                  )}
                </div>
                
                {artigo.palavrasChave && artigo.palavrasChave.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong style={{ color: '#495057' }}>Palavras-chave:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {artigo.palavrasChave.map((palavra, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            margin: '0.2rem 0.5rem 0.2rem 0'
                          }}
                        >
                          {palavra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '2rem' }}>
            Nenhum artigo encontrado para esta edição.
          </p>
        )}
      </section>
      
      {error && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            ⚠️ {error} - Exibindo dados de exemplo
          </p>
        </div>
      )}
    </div>
  );
};

export default EdicaoPage;
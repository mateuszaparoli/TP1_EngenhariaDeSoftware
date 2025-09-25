import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const AutorPage = () => {
  const { nomeAutor } = useParams();
  const [autor, setAutor] = useState(null);
  const [artigos, setArtigos] = useState([]);
  const [artigosPorAno, setArtigosPorAno] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAutorArtigos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar artigos do autor
        const response = await apiService.get(`/authors/${nomeAutor}/articles`);
        
        // A resposta pode conter informações do autor e seus artigos
        if (response.autor) {
          setAutor(response.autor);
        } else {
          // Criar dados do autor a partir do parâmetro da URL
          setAutor({
            nome: nomeAutor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            nomeUrl: nomeAutor
          });
        }
        
        const artigosData = response.artigos || response;
        setArtigos(artigosData);
        
        // Agrupar artigos por ano
        const agrupados = agruparArtigosPorAno(artigosData);
        setArtigosPorAno(agrupados);
        
      } catch (err) {
        console.error('Erro ao buscar artigos do autor:', err);
        setError('Erro ao carregar artigos do autor');
        
        // Dados mock para desenvolvimento/teste
        const nomeFormatado = nomeAutor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setAutor({
          nome: nomeFormatado,
          nomeUrl: nomeAutor,
          instituicao: 'Universidade Federal do Brasil',
          bio: 'Pesquisador na área de Engenharia de Software e Sistemas Distribuídos.'
        });
        
        const artigosMock = [
          {
            id: 1,
            titulo: 'Arquitetura de Microsserviços em Sistemas Distribuídos',
            ano: 2025,
            evento: 'SBES',
            coautores: ['Maria Santos', 'Pedro Costa'],
            paginas: '1-12',
            palavrasChave: ['microsserviços', 'sistemas distribuídos']
          },
          {
            id: 2,
            titulo: 'Machine Learning aplicado à Análise de Dados',
            ano: 2024,
            evento: 'SBBD',
            coautores: ['Ana Oliveira'],
            paginas: '45-58',
            palavrasChave: ['machine learning', 'análise de dados']
          },
          {
            id: 3,
            titulo: 'Desenvolvimento Ágil com DevOps: Práticas e Ferramentas',
            ano: 2024,
            evento: 'SBES',
            coautores: ['Luciana Rodrigues', 'Carlos Mendes'],
            paginas: '23-35',
            palavrasChave: ['devops', 'desenvolvimento ágil']
          },
          {
            id: 4,
            titulo: 'Blockchain e Contratos Inteligentes: Uma Análise Comparativa',
            ano: 2023,
            evento: 'SBRC',
            coautores: [],
            paginas: '78-90',
            palavrasChave: ['blockchain', 'contratos inteligentes']
          }
        ];
        
        setArtigos(artigosMock);
        const agrupados = agruparArtigosPorAno(artigosMock);
        setArtigosPorAno(agrupados);
        
      } finally {
        setLoading(false);
      }
    };

    if (nomeAutor) {
      fetchAutorArtigos();
    }
  }, [nomeAutor]);

  const agruparArtigosPorAno = (artigos) => {
    return artigos.reduce((grupos, artigo) => {
      const ano = artigo.ano;
      if (!grupos[ano]) {
        grupos[ano] = [];
      }
      grupos[ano].push(artigo);
      return grupos;
    }, {});
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Carregando...</h2>
        <p>Buscando artigos do autor...</p>
      </div>
    );
  }

  if (error && !autor) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>Erro</h2>
        <p>{error}</p>
      </div>
    );
  }

  const anosOrdenados = Object.keys(artigosPorAno).sort((a, b) => b - a);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Header do Autor */}
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          {autor?.nome || nomeAutor.replace(/-/g, ' ')}
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {autor?.instituicao && (
            <div>
              <strong>Instituição:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{autor.instituicao}</p>
            </div>
          )}
          
          <div>
            <strong>Total de Publicações:</strong>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{artigos.length} artigos</p>
          </div>
          
          <div>
            <strong>Anos de Publicação:</strong>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              {anosOrdenados.join(', ') || 'N/A'}
            </p>
          </div>
        </div>

        {autor?.bio && (
          <p style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
            {autor.bio}
          </p>
        )}
      </header>

      {/* Artigos Agrupados por Ano */}
      <section>
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          Publicações por Ano
        </h2>
        
        {anosOrdenados.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {anosOrdenados.map((ano) => (
              <div key={ano}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '1.5rem',
                  fontSize: '1.5rem',
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '0.5rem'
                }}>
                  {ano} ({artigosPorAno[ano].length} {artigosPorAno[ano].length === 1 ? 'artigo' : 'artigos'})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {artigosPorAno[ano].map((artigo, index) => (
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
                      <h4 style={{ 
                        margin: '0 0 1rem 0', 
                        color: '#2c3e50',
                        fontSize: '1.2rem',
                        lineHeight: '1.4'
                      }}>
                        {artigo.titulo}
                      </h4>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '2rem',
                        marginBottom: '1rem'
                      }}>
                        {artigo.evento && (
                          <div>
                            <strong style={{ color: '#495057' }}>Evento:</strong>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                              <Link 
                                to={`/eventos/${artigo.evento.toLowerCase()}`}
                                style={{ color: '#007bff', textDecoration: 'none' }}
                              >
                                {artigo.evento}
                              </Link>
                              {artigo.ano && ` ${artigo.ano}`}
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

                      {artigo.coautores && artigo.coautores.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong style={{ color: '#495057' }}>Coautores:</strong>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                            {artigo.coautores.map((coautor, idx) => (
                              <span key={idx}>
                                <Link 
                                  to={`/autor/${coautor.toLowerCase().replace(/\s+/g, '-')}`}
                                  style={{ color: '#007bff', textDecoration: 'none' }}
                                >
                                  {coautor}
                                </Link>
                                {idx < artigo.coautores.length - 1 && ', '}
                              </span>
                            ))}
                          </p>
                        </div>
                      )}
                      
                      {artigo.palavrasChave && artigo.palavrasChave.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong style={{ color: '#495057' }}>Palavras-chave:</strong>
                          <div style={{ marginTop: '0.5rem' }}>
                            {artigo.palavrasChave.map((palavra, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#e8f5e8',
                                  color: '#2e7d32',
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
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '2rem' }}>
            Nenhuma publicação encontrada para este autor.
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

export default AutorPage;
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './BuscaPage.css';

const BuscaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const termoBusca = searchParams.get('q');
  
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    ano: '',
    evento: '',
    autor: '',
    ordenacao: 'relevancia'
  });
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const resultadosPorPagina = 10;

  useEffect(() => {
    const fetchResultados = async () => {
      if (!termoBusca) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Construir query com filtros
        const queryParams = new URLSearchParams({
          q: termoBusca,
          page: paginaAtual.toString(),
          limit: resultadosPorPagina.toString(),
          ...Object.fromEntries(Object.entries(filtros).filter(([_, value]) => value !== ''))
        });
        
        const response = await apiService.get(`/search?${queryParams.toString()}`);
        setResultados(response.artigos || response.results || response);
        setTotalResultados(response.total || response.length || 0);
        
      } catch (err) {
        console.error('Erro ao buscar artigos:', err);
        setError('Erro ao realizar a busca');
        
        // Dados mock para desenvolvimento/teste com mais variedade
        const resultadosMock = [
          {
            id: 1,
            titulo: 'Arquitetura de Microsserviços em Sistemas Distribuídos',
            autores: ['João Silva', 'Maria Santos'],
            ano: 2025,
            evento: 'SBES',
            resumo: 'Este artigo apresenta uma análise detalhada sobre arquiteturas de microsserviços em ambientes de alta disponibilidade...',
            palavrasChave: ['microsserviços', 'sistemas distribuídos', 'arquitetura'],
            citacoes: 23,
            downloads: 145
          },
          {
            id: 2,
            titulo: 'Machine Learning aplicado à Análise de Sentimentos em Redes Sociais',
            autores: ['Pedro Costa', 'Ana Oliveira', 'Carlos Mendes'],
            ano: 2024,
            evento: 'SBBD',
            resumo: 'Proposta de um modelo híbrido de machine learning para análise de sentimentos em tempo real usando transformers...',
            palavrasChave: ['machine learning', 'análise de sentimentos', 'processamento de linguagem natural', 'redes sociais'],
            citacoes: 18,
            downloads: 298
          },
          {
            id: 3,
            titulo: 'Blockchain e Contratos Inteligentes: Uma Análise Comparativa de Performance',
            autores: ['Fernanda Lima', 'Roberto Alves'],
            ano: 2023,
            evento: 'SBRC',
            resumo: 'Comparação detalhada entre diferentes implementações de contratos inteligentes em termos de performance e segurança...',
            palavrasChave: ['blockchain', 'contratos inteligentes', 'criptografia', 'performance'],
            citacoes: 31,
            downloads: 187
          },
          {
            id: 4,
            titulo: 'Inteligência Artificial Explicável em Sistemas Médicos',
            autores: ['Dra. Lucia Ferreira', 'Dr. Marcos Ribeiro'],
            ano: 2024,
            evento: 'CBIS',
            resumo: 'Desenvolvimento de técnicas de XAI para sistemas de diagnóstico médico automatizado...',
            palavrasChave: ['inteligência artificial', 'XAI', 'medicina', 'diagnóstico'],
            citacoes: 12,
            downloads: 89
          },
          {
            id: 5,
            titulo: 'Computação em Nuvem: Otimização de Custos em Ambientes Multi-Cloud',
            autores: ['Paulo Santos', 'Helena Castro'],
            ano: 2023,
            evento: 'SBAC-PAD',
            resumo: 'Estratégias para otimização de custos em arquiteturas multi-cloud considerando performance e disponibilidade...',
            palavrasChave: ['computação em nuvem', 'multi-cloud', 'otimização', 'custos'],
            citacoes: 27,
            downloads: 156
          }
        ];
        
        // Filtrar resultados mock baseado no termo de busca e filtros
        let resultadosFiltrados = resultadosMock.filter(artigo => 
          artigo.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
          artigo.autores.some(autor => autor.toLowerCase().includes(termoBusca.toLowerCase())) ||
          artigo.palavrasChave.some(palavra => palavra.toLowerCase().includes(termoBusca.toLowerCase())) ||
          artigo.resumo.toLowerCase().includes(termoBusca.toLowerCase())
        );

        // Aplicar filtros
        if (filtros.ano) {
          resultadosFiltrados = resultadosFiltrados.filter(artigo => artigo.ano.toString() === filtros.ano);
        }
        if (filtros.evento) {
          resultadosFiltrados = resultadosFiltrados.filter(artigo => 
            artigo.evento.toLowerCase().includes(filtros.evento.toLowerCase())
          );
        }
        if (filtros.autor) {
          resultadosFiltrados = resultadosFiltrados.filter(artigo =>
            artigo.autores.some(autor => autor.toLowerCase().includes(filtros.autor.toLowerCase()))
          );
        }

        // Ordenar resultados
        switch (filtros.ordenacao) {
          case 'ano_desc':
            resultadosFiltrados.sort((a, b) => b.ano - a.ano);
            break;
          case 'ano_asc':
            resultadosFiltrados.sort((a, b) => a.ano - b.ano);
            break;
          case 'citacoes':
            resultadosFiltrados.sort((a, b) => (b.citacoes || 0) - (a.citacoes || 0));
            break;
          case 'downloads':
            resultadosFiltrados.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
          default: // relevancia
            break;
        }
        
        setTotalResultados(resultadosFiltrados.length);
        // Simular paginação
        const inicio = (paginaAtual - 1) * resultadosPorPagina;
        const fim = inicio + resultadosPorPagina;
        setResultados(resultadosFiltrados.slice(inicio, fim));
        
      } finally {
        setLoading(false);
      }
    };

    fetchResultados();
  }, [termoBusca, filtros, paginaAtual]);

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  const clearFiltros = () => {
    setFiltros({
      ano: '',
      evento: '',
      autor: '',
      ordenacao: 'relevancia'
    });
    setPaginaAtual(1);
  };

  const totalPaginas = Math.ceil(totalResultados / resultadosPorPagina);

  if (!termoBusca) {
    return (
      <div className="busca-container">
        <div className="busca-header">
          <div className="header-content">
            <h1>🔍 Busca Avançada</h1>
            <p>Nenhum termo de busca foi fornecido</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="busca-container">
        <div className="busca-header">
          <div className="header-content">
            <h1>🔍 Buscando...</h1>
            <p>Procurando por "{termoBusca}"</p>
          </div>
        </div>
        <div className="loading-section">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Analisando nossa base de conhecimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="busca-container">
      <div className="busca-header">
        <div className="header-content">
          <h1>🔍 Resultados da Busca</h1>
          <div className="busca-stats">
            <p className="termo-busca">
              Termo buscado: <strong>"{termoBusca}"</strong>
            </p>
            <p className="resultado-count">
              {totalResultados > 0 
                ? `${totalResultados} resultado${totalResultados !== 1 ? 's' : ''} encontrado${totalResultados !== 1 ? 's' : ''}`
                : 'Nenhum resultado encontrado'
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Aviso:</strong> {error}
              <p>Exibindo resultados de exemplo para demonstração</p>
            </div>
          </div>
        </div>
      )}

      <div className="busca-controls">
        <button 
          className={`filtros-toggle ${filtrosVisiveis ? 'active' : ''}`}
          onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
        >
          🎛️ Filtros {filtrosVisiveis ? '▲' : '▼'}
        </button>
        
        {filtrosVisiveis && (
          <div className="filtros-panel">
            <div className="filtros-grid">
              <div className="filtro-group">
                <label>Ano:</label>
                <select 
                  value={filtros.ano} 
                  onChange={(e) => handleFiltroChange('ano', e.target.value)}
                >
                  <option value="">Todos os anos</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Evento:</label>
                <select 
                  value={filtros.evento} 
                  onChange={(e) => handleFiltroChange('evento', e.target.value)}
                >
                  <option value="">Todos os eventos</option>
                  <option value="SBES">SBES</option>
                  <option value="SBBD">SBBD</option>
                  <option value="SBRC">SBRC</option>
                  <option value="CBIS">CBIS</option>
                  <option value="SBAC-PAD">SBAC-PAD</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Ordenar por:</label>
                <select 
                  value={filtros.ordenacao} 
                  onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                >
                  <option value="relevancia">Relevância</option>
                  <option value="ano_desc">Ano (mais recente)</option>
                  <option value="ano_asc">Ano (mais antigo)</option>
                  <option value="citacoes">Mais citados</option>
                  <option value="downloads">Mais baixados</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Autor:</label>
                <input
                  type="text"
                  placeholder="Nome do autor..."
                  value={filtros.autor}
                  onChange={(e) => handleFiltroChange('autor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filtros-actions">
              <button className="clear-filtros" onClick={clearFiltros}>
                🗑️ Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="resultados-section">
        {resultados.length > 0 ? (
          <>
            <div className="resultados-lista">
              {resultados.map((artigo, index) => (
                <article key={artigo.id || index} className="resultado-card">
                  <div className="card-header">
                    <h3 className="resultado-titulo">
                      {artigo.titulo}
                    </h3>
                    <div className="card-stats">
                      {artigo.citacoes && (
                        <span className="stat-badge citations">
                          📖 {artigo.citacoes} citações
                        </span>
                      )}
                      {artigo.downloads && (
                        <span className="stat-badge downloads">
                          ⬇️ {artigo.downloads} downloads
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="resultado-meta">
                    <div className="autores-section">
                      <strong>👥 Autores:</strong>
                      <div className="autores-lista">
                        {artigo.autores.map((autor, idx) => (
                          <span key={idx}>
                            <Link 
                              to={`/autor/${autor.toLowerCase().replace(/\s+/g, '-')}`}
                              className="autor-link"
                            >
                              {autor}
                            </Link>
                            {idx < artigo.autores.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="evento-info">
                      <Link 
                        to={`/eventos/${artigo.evento.toLowerCase()}/${artigo.ano}`}
                        className="evento-badge"
                      >
                        📅 {artigo.evento} {artigo.ano}
                      </Link>
                    </div>
                  </div>

                  {artigo.resumo && (
                    <div className="resultado-resumo">
                      <p>{artigo.resumo}</p>
                    </div>
                  )}

                  {artigo.palavrasChave && artigo.palavrasChave.length > 0 && (
                    <div className="palavras-chave-section">
                      <span className="section-label">🏷️ Tags:</span>
                      <div className="palavras-chave">
                        {artigo.palavrasChave.map((palavra, idx) => (
                          <span key={idx} className="palavra-chave-tag">
                            {palavra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card-actions">
                    <button className="action-btn primary">
                      📄 Ver Detalhes
                    </button>
                    <button className="action-btn secondary">
                      🔗 Citar Artigo
                    </button>
                    <button className="action-btn secondary">
                      ❤️ Favoritar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="paginacao">
                <button 
                  className="pagina-btn"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                >
                  ← Anterior
                </button>
                
                <div className="paginas-numeros">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    const pagina = Math.max(1, Math.min(totalPaginas - 4, paginaAtual - 2)) + i;
                    return (
                      <button
                        key={pagina}
                        className={`pagina-numero ${paginaAtual === pagina ? 'active' : ''}`}
                        onClick={() => setPaginaAtual(pagina)}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                </div>

                <button 
                  className="pagina-btn"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="sem-resultados">
            <div className="sem-resultados-icon">🔍</div>
            <h3>Nenhum resultado encontrado</h3>
            <p>Não encontramos artigos que correspondam aos critérios de busca.</p>
            <div className="dicas-busca">
              <h4>💡 Dicas para melhorar sua busca:</h4>
              <ul>
                <li>Verifique a ortografia dos termos</li>
                <li>Use palavras-chave mais específicas ou mais gerais</li>
                <li>Tente buscar por nome completo de autor</li>
                <li>Experimente termos em inglês</li>
                <li>Use os filtros para refinar a busca</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscaPage;
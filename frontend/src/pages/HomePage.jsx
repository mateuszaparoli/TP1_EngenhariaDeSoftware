import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [termoBusca, setTermoBusca] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!termoBusca.trim()) {
      return;
    }

    // Redirecionar para página de busca com o termo pesquisado
    navigate(`/busca?q=${encodeURIComponent(termoBusca.trim())}`);
  };

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <div className="library-icon">📚</div>
            <h1>Biblioteca Digital</h1>
            <h2>Artigos Científicos e Publicações Acadêmicas</h2>
          </div>
          <p className="hero-subtitle">
            Acesse facilmente artigos publicados em eventos científicos, 
            conferências e simpósios da área de Computação
          </p>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-container">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Pesquise por título, autor, palavra-chave ou evento..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍 Buscar
              </button>
            </div>
            <div className="search-suggestions">
              <span>Sugestões:</span>
              <button type="button" onClick={() => setTermoBusca('machine learning')}>machine learning</button>
              <button type="button" onClick={() => setTermoBusca('software engineering')}>software engineering</button>
              <button type="button" onClick={() => setTermoBusca('artificial intelligence')}>artificial intelligence</button>
            </div>
          </form>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">29.567</div>
            <div className="stat-label">Anais de Eventos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1.986</div>
            <div className="stat-label">Periódicos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">140</div>
            <div className="stat-label">Livros e Relatórios</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">45.000+</div>
            <div className="stat-label">Artigos Indexados</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-container">
          <h3>Explore Nossa Biblioteca</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h4>Busca por Artigos</h4>
              <p>Encontre artigos científicos por título, palavras-chave, resumo ou área de pesquisa</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h4>Busca por Autores</h4>
              <p>Descubra publicações de pesquisadores específicos e suas contribuições acadêmicas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Busca por Eventos</h4>
              <p>Explore artigos publicados em conferências, simpósios e workshops científicos</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>Acesso Organizado</h4>
              <p>Navegue por categorias, anos de publicação e áreas específicas de conhecimento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="highlights-section">
        <div className="highlights-container">
          <h3>Em Destaque</h3>
          <div className="highlight-grid">
            <div className="highlight-card">
              <h4>Últimas Adições</h4>
              <p>Artigos recém-publicados em eventos nacionais e internacionais de Computação</p>
              <Link to="/busca?filter=recent" className="highlight-link">Ver Recentes →</Link>
            </div>
            <div className="highlight-card">
              <h4>Mais Acessados</h4>
              <p>Descobra os artigos e autores mais consultados pela comunidade acadêmica</p>
              <Link to="/busca?filter=popular" className="highlight-link">Ver Populares →</Link>
            </div>
            <div className="highlight-card">
              <h4>Eventos em Destaque</h4>
              <p>SBES, SBRC, CSBC e outros importantes eventos da área de Computação no Brasil</p>
              <Link to="/busca?filter=events" className="highlight-link">Ver Eventos →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-container">
          <h3>Mantenha-se Atualizado</h3>
          <p>Receba notificações sobre novos artigos, eventos acadêmicos e publicações relevantes para sua área de pesquisa</p>
          <Link to="/inscrever" className="cta-button">
            📧 Inscrever-se Gratuitamente
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
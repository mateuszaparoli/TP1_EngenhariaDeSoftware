import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const EventoPage = () => {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [edicoes, setEdicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados do evento
        const eventoData = await apiService.get(`/events/${slug}`);
        setEvento(eventoData);
        
        // As edições podem vir junto com os dados do evento ou em uma propriedade separada
        if (eventoData.edicoes) {
          setEdicoes(eventoData.edicoes);
        }
        
      } catch (err) {
        console.error('Erro ao buscar dados do evento:', err);
        setError('Erro ao carregar dados do evento');
        
        // Dados mock para desenvolvimento/teste
        setEvento({
          nome: `Evento ${slug.toUpperCase()}`,
          slug: slug,
          descricao: 'Descrição do evento será carregada da API'
        });
        
        setEdicoes([
          { ano: '2023', titulo: `${slug.toUpperCase()} 2023`, artigos: 25 },
          { ano: '2024', titulo: `${slug.toUpperCase()} 2024`, artigos: 32 },
          { ano: '2025', titulo: `${slug.toUpperCase()} 2025`, artigos: 18 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEventoData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Carregando...</h2>
        <p>Buscando dados do evento...</p>
      </div>
    );
  }

  if (error && !evento) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>Erro</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1>{evento?.nome || `Evento ${slug}`}</h1>
        {evento?.descricao && (
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1rem' }}>
            {evento.descricao}
          </p>
        )}
      </header>

      <section>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
          Edições do Evento
        </h2>
        
        {edicoes.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {edicoes.map((edicao) => (
              <div 
                key={edicao.ano}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: '#f9f9f9',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                  {edicao.titulo || `${evento?.nome} ${edicao.ano}`}
                </h3>
                
                {edicao.artigos && (
                  <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                    {edicao.artigos} artigos publicados
                  </p>
                )}
                
                <Link 
                  to={`/eventos/${slug}/${edicao.ano}`}
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  Ver Edição {edicao.ano}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            Nenhuma edição encontrada para este evento.
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

export default EventoPage;
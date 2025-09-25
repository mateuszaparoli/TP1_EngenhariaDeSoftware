import { useParams } from 'react-router-dom';

const EventoSlugAno = () => {
  const { slug, ano } = useParams();
  
  return (
    <div>
      <h1>Evento: {slug} - Ano: {ano}</h1>
      <p>Esta é a página do evento {slug} para o ano {ano}</p>
    </div>
  );
};

export default EventoSlugAno;
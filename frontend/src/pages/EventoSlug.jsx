import { useParams } from 'react-router-dom';

const EventoSlug = () => {
  const { slug } = useParams();
  
  return (
    <div>
      <h1>Evento: {slug}</h1>
      <p>Esta é a página do evento com slug: {slug}</p>
    </div>
  );
};

export default EventoSlug;
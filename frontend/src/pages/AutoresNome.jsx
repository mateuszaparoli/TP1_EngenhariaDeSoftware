import { useParams } from 'react-router-dom';

const AutoresNome = () => {
  const { nomeAutor } = useParams();
  
  return (
    <div>
      <h1>Autor: {nomeAutor}</h1>
      <p>Esta é a página do autor: {nomeAutor}</p>
    </div>
  );
};

export default AutoresNome;
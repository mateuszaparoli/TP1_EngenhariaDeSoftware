import { useState } from 'react';
import { apiService } from '../services/api';
import './InscreverPage.css';

const Inscrever = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // 'sucesso' ou 'erro'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim() || !formData.email.trim()) {
      setMensagem('Por favor, preencha todos os campos.');
      setTipoMensagem('erro');
      return;
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMensagem('Por favor, insira um e-mail válido.');
      setTipoMensagem('erro');
      return;
    }

    try {
      setLoading(true);
      setMensagem('');
      
      // Enviar dados para a API
      const response = await apiService.post('/subscribe', formData);
      
      setMensagem('Inscrição realizada com sucesso!');
      setTipoMensagem('sucesso');
      
      // Limpar o formulário após sucesso
      setFormData({ nome: '', email: '' });
      
    } catch (error) {
      console.error('Erro ao realizar inscrição:', error);
      
      // Verificar se há uma mensagem específica do servidor
      const mensagemErro = error.response?.data?.message || 
                          error.response?.data?.erro || 
                          'Erro ao realizar inscrição. Tente novamente.';
      
      setMensagem(mensagemErro);
      setTipoMensagem('erro');
      
    } finally {
      setLoading(false);
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 5000);
    }
  };

  return (
    <div className="inscrever-container">
      <div className="inscrever-header">
        <h1>Inscrever-se</h1>
        <p>Receba atualizações sobre novos artigos e eventos acadêmicos</p>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="inscrever-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Digite seu e-mail"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Inscrevendo...
                </>
              ) : (
                'Inscrever'
              )}
            </button>
          </div>
        </form>

        {mensagem && (
          <div className={`mensagem ${tipoMensagem}`}>
            <p>{mensagem}</p>
          </div>
        )}

        <div className="info-section">
          <div className="info-card">
            <h3>📧 Newsletter</h3>
            <p>Receba notificações sobre novos artigos publicados</p>
          </div>
          <div className="info-card">
            <h3>🔔 Eventos</h3>
            <p>Seja informado sobre próximos eventos e conferências</p>
          </div>
          <div className="info-card">
            <h3>🔒 Privacidade</h3>
            <p>Seus dados são protegidos e nunca compartilhados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscrever;
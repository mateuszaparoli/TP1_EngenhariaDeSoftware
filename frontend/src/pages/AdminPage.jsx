import { useState } from 'react';
import './Admin.css';

const AdminPage = () => {
  // Estados para Eventos
  const [eventos, setEventos] = useState([
    { id: 1, nome: 'SBES - Simpósio Brasileiro de Engenharia de Software', slug: 'sbes', descricao: 'Principal evento de engenharia de software do Brasil', status: 'Ativo' },
    { id: 2, nome: 'SBBD - Simpósio Brasileiro de Banco de Dados', slug: 'sbbd', descricao: 'Evento focado em banco de dados e big data', status: 'Ativo' },
    { id: 3, nome: 'SBRC - Simpósio Brasileiro de Redes de Computadores', slug: 'sbrc', descricao: 'Evento sobre redes e sistemas distribuídos', status: 'Rascunho' },
  ]);

  // Estados para Edições
  const [edicoes, setEdicoes] = useState([
    { id: 1, eventoId: 1, ano: 2025, local: 'São Paulo, SP', dataInicio: '2025-09-15', dataFim: '2025-09-18', status: 'Planejamento' },
    { id: 2, eventoId: 1, ano: 2024, local: 'Rio de Janeiro, RJ', dataInicio: '2024-09-20', dataFim: '2024-09-23', status: 'Finalizado' },
    { id: 3, eventoId: 2, ano: 2025, local: 'Brasília, DF', dataInicio: '2025-10-10', dataFim: '2025-10-13', status: 'Planejamento' },
  ]);

  // Estados para Artigos
  const [artigos, setArtigos] = useState([
    { id: 1, titulo: 'Arquitetura de Microsserviços em Sistemas Distribuídos', autores: 'João Silva, Maria Santos', ano: 2025, edicaoId: 1, status: 'Publicado', arquivo: 'artigo1.pdf' },
    { id: 2, titulo: 'Machine Learning aplicado à Análise de Sentimentos', autores: 'Pedro Costa', ano: 2024, edicaoId: 2, status: 'Publicado', arquivo: 'artigo2.pdf' },
  ]);

  // Estados para formulários
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    slug: '',
    descricao: '',
    status: 'Rascunho'
  });

  const [novaEdicao, setNovaEdicao] = useState({
    eventoId: '',
    ano: new Date().getFullYear(),
    local: '',
    dataInicio: '',
    dataFim: '',
    status: 'Planejamento'
  });

  const [novoArtigo, setNovoArtigo] = useState({
    titulo: '',
    autores: '',
    resumo: '',
    palavrasChave: '',
    edicaoId: '',
    arquivo: null,
    status: 'Rascunho'
  });

  // Estados de controle
  const [abaSelecionada, setAbaSelecionada] = useState('eventos');
  const [mostrarFormularioEvento, setMostrarFormularioEvento] = useState(false);
  const [mostrarFormularioEdicao, setMostrarFormularioEdicao] = useState(false);
  const [mostrarFormularioArtigo, setMostrarFormularioArtigo] = useState(false);
  const [mostrarImportBibtex, setMostrarImportBibtex] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [edicaoEditando, setEdicaoEditando] = useState(null);
  const [artigoEditando, setArtigoEditando] = useState(null);

  // Handlers para Eventos
  const handleEventoInputChange = (e) => {
    const { name, value } = e.target;
    setNovoEvento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventoSubmit = (e) => {
    e.preventDefault();
    if (eventoEditando) {
      setEventos(prev => prev.map(evento => 
        evento.id === eventoEditando.id 
          ? { ...novoEvento, id: eventoEditando.id }
          : evento
      ));
      setEventoEditando(null);
    } else {
      const novoId = Math.max(...eventos.map(e => e.id)) + 1;
      setEventos(prev => [...prev, { ...novoEvento, id: novoId }]);
    }
    setNovoEvento({ nome: '', slug: '', descricao: '', status: 'Rascunho' });
    setMostrarFormularioEvento(false);
  };

  const handleEditarEvento = (evento) => {
    setEventoEditando(evento);
    setNovoEvento({
      nome: evento.nome,
      slug: evento.slug,
      descricao: evento.descricao,
      status: evento.status
    });
    setMostrarFormularioEvento(true);
  };

  const handleExcluirEvento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento? Todas as edições associadas também serão removidas.')) {
      setEventos(prev => prev.filter(evento => evento.id !== id));
      setEdicoes(prev => prev.filter(edicao => edicao.eventoId !== id));
    }
  };

  // Handlers para Edições
  const handleEdicaoInputChange = (e) => {
    const { name, value } = e.target;
    setNovaEdicao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdicaoSubmit = (e) => {
    e.preventDefault();
    if (edicaoEditando) {
      setEdicoes(prev => prev.map(edicao => 
        edicao.id === edicaoEditando.id 
          ? { ...novaEdicao, id: edicaoEditando.id }
          : edicao
      ));
      setEdicaoEditando(null);
    } else {
      const novoId = Math.max(...edicoes.map(e => e.id)) + 1;
      setEdicoes(prev => [...prev, { ...novaEdicao, id: novoId }]);
    }
    setNovaEdicao({ eventoId: '', ano: new Date().getFullYear(), local: '', dataInicio: '', dataFim: '', status: 'Planejamento' });
    setMostrarFormularioEdicao(false);
  };

  const handleEditarEdicao = (edicao) => {
    setEdicaoEditando(edicao);
    setNovaEdicao({
      eventoId: edicao.eventoId,
      ano: edicao.ano,
      local: edicao.local,
      dataInicio: edicao.dataInicio,
      dataFim: edicao.dataFim,
      status: edicao.status
    });
    setMostrarFormularioEdicao(true);
  };

  const handleExcluirEdicao = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta edição?')) {
      setEdicoes(prev => prev.filter(edicao => edicao.id !== id));
    }
  };

  // Handlers para Artigos
  const handleArtigoInputChange = (e) => {
    const { name, value, files } = e.target;
    setNovoArtigo(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleArtigoSubmit = (e) => {
    e.preventDefault();
    if (artigoEditando) {
      setArtigos(prev => prev.map(artigo => 
        artigo.id === artigoEditando.id 
          ? { ...novoArtigo, id: artigoEditando.id, arquivo: novoArtigo.arquivo?.name || artigoEditando.arquivo }
          : artigo
      ));
      setArtigoEditando(null);
    } else {
      const novoId = Math.max(...artigos.map(a => a.id)) + 1;
      setArtigos(prev => [...prev, { 
        ...novoArtigo, 
        id: novoId, 
        arquivo: novoArtigo.arquivo?.name || 'sem-arquivo.pdf' 
      }]);
    }
    setNovoArtigo({ titulo: '', autores: '', resumo: '', palavrasChave: '', edicaoId: '', arquivo: null, status: 'Rascunho' });
    setMostrarFormularioArtigo(false);
  };

  const handleEditarArtigo = (artigo) => {
    setArtigoEditando(artigo);
    setNovoArtigo({
      titulo: artigo.titulo,
      autores: artigo.autores,
      resumo: artigo.resumo || '',
      palavrasChave: artigo.palavrasChave || '',
      edicaoId: artigo.edicaoId,
      arquivo: null,
      status: artigo.status
    });
    setMostrarFormularioArtigo(true);
  };

  const handleExcluirArtigo = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
      setArtigos(prev => prev.filter(artigo => artigo.id !== id));
    }
  };

  // Handler para importação BibTeX
  const handleBibtexImport = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('bibtexFile');
    const edicaoId = formData.get('edicaoImport');
    
    if (!file || !edicaoId) {
      alert('Por favor, selecione um arquivo BibTeX e uma edição.');
      return;
    }

    // Simulação de importação
    const novosArtigos = [
      { 
        id: Math.max(...artigos.map(a => a.id)) + 1,
        titulo: 'Artigo Importado do BibTeX 1',
        autores: 'Autor Exemplo 1, Autor Exemplo 2',
        ano: 2025,
        edicaoId: parseInt(edicaoId),
        status: 'Importado',
        arquivo: 'importado1.pdf'
      },
      { 
        id: Math.max(...artigos.map(a => a.id)) + 2,
        titulo: 'Artigo Importado do BibTeX 2',
        autores: 'Autor Exemplo 3',
        ano: 2025,
        edicaoId: parseInt(edicaoId),
        status: 'Importado',
        arquivo: 'importado2.pdf'
      }
    ];

    setArtigos(prev => [...prev, ...novosArtigos]);
    setMostrarImportBibtex(false);
    alert(`${novosArtigos.length} artigos importados com sucesso!`);
  };

  // Funções auxiliares
  const getEventoNome = (eventoId) => {
    const evento = eventos.find(e => e.id === eventoId);
    return evento ? evento.nome : 'Evento não encontrado';
  };

  const getEdicaoInfo = (edicaoId) => {
    const edicao = edicoes.find(e => e.id === edicaoId);
    if (!edicao) return 'Edição não encontrada';
    const evento = eventos.find(e => e.id === edicao.eventoId);
    return `${evento?.nome || 'Evento'} ${edicao.ano}`;
  };

  const cancelarFormularios = () => {
    setMostrarFormularioEvento(false);
    setMostrarFormularioEdicao(false);
    setMostrarFormularioArtigo(false);
    setMostrarImportBibtex(false);
    setEventoEditando(null);
    setEdicaoEditando(null);
    setArtigoEditando(null);
    setNovoEvento({ nome: '', slug: '', descricao: '', status: 'Rascunho' });
    setNovaEdicao({ eventoId: '', ano: new Date().getFullYear(), local: '', dataInicio: '', dataFim: '', status: 'Planejamento' });
    setNovoArtigo({ titulo: '', autores: '', resumo: '', palavrasChave: '', edicaoId: '', arquivo: null, status: 'Rascunho' });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <p>Gerencie eventos, edições, artigos e todo o conteúdo do sistema</p>
      </div>

      {/* Navegação por Abas */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${abaSelecionada === 'eventos' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('eventos')}
        >
          📅 Eventos
        </button>
        <button 
          className={`tab-button ${abaSelecionada === 'edicoes' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('edicoes')}
        >
          📆 Edições
        </button>
        <button 
          className={`tab-button ${abaSelecionada === 'artigos' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('artigos')}
        >
          📄 Artigos
        </button>
      </div>

      {/* Aba de Eventos */}
      {abaSelecionada === 'eventos' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gerenciar Eventos</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setMostrarFormularioEvento(true)}
            >
              + Novo Evento
            </button>
          </div>

          {/* Formulário de Evento */}
          {mostrarFormularioEvento && (
            <div className="form-modal">
              <div className="form-container">
                <h3>{eventoEditando ? 'Editar Evento' : 'Criar Novo Evento'}</h3>
                <form onSubmit={handleEventoSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nome">Nome do Evento</label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={novoEvento.nome}
                        onChange={handleEventoInputChange}
                        placeholder="ex: Simpósio Brasileiro de Engenharia de Software"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="slug">Slug (URL)</label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={novoEvento.slug}
                        onChange={handleEventoInputChange}
                        placeholder="ex: sbes"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      value={novoEvento.descricao}
                      onChange={handleEventoInputChange}
                      placeholder="Descrição do evento..."
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={novoEvento.status}
                        onChange={handleEventoInputChange}
                      >
                        <option value="Rascunho">Rascunho</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Arquivado">Arquivado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={cancelarFormularios}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {eventoEditando ? 'Atualizar' : 'Criar'} Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabela de Eventos */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => (
                  <tr key={evento.id}>
                    <td>{evento.nome}</td>
                    <td><code>{evento.slug}</code></td>
                    <td className="description-cell">{evento.descricao}</td>
                    <td>
                      <span className={`status status-${evento.status.toLowerCase()}`}>
                        {evento.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEditarEvento(evento)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleExcluirEvento(evento.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-info">
            <p>Total: {eventos.length} eventos</p>
          </div>
        </div>
      )}

      {/* Aba de Edições */}
      {abaSelecionada === 'edicoes' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gerenciar Edições</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setMostrarFormularioEdicao(true)}
            >
              + Nova Edição
            </button>
          </div>

          {/* Formulário de Edição */}
          {mostrarFormularioEdicao && (
            <div className="form-modal">
              <div className="form-container">
                <h3>{edicaoEditando ? 'Editar Edição' : 'Criar Nova Edição'}</h3>
                <form onSubmit={handleEdicaoSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="eventoId">Evento</label>
                      <select
                        id="eventoId"
                        name="eventoId"
                        value={novaEdicao.eventoId}
                        onChange={handleEdicaoInputChange}
                        required
                      >
                        <option value="">Selecione um evento</option>
                        {eventos.map(evento => (
                          <option key={evento.id} value={evento.id}>
                            {evento.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ano">Ano</label>
                      <input
                        type="number"
                        id="ano"
                        name="ano"
                        value={novaEdicao.ano}
                        onChange={handleEdicaoInputChange}
                        min="2020"
                        max="2030"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="local">Local</label>
                    <input
                      type="text"
                      id="local"
                      name="local"
                      value={novaEdicao.local}
                      onChange={handleEdicaoInputChange}
                      placeholder="ex: São Paulo, SP"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dataInicio">Data de Início</label>
                      <input
                        type="date"
                        id="dataInicio"
                        name="dataInicio"
                        value={novaEdicao.dataInicio}
                        onChange={handleEdicaoInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dataFim">Data de Fim</label>
                      <input
                        type="date"
                        id="dataFim"
                        name="dataFim"
                        value={novaEdicao.dataFim}
                        onChange={handleEdicaoInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={novaEdicao.status}
                        onChange={handleEdicaoInputChange}
                      >
                        <option value="Planejamento">Planejamento</option>
                        <option value="Aberto">Aberto para Submissões</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={cancelarFormularios}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {edicaoEditando ? 'Atualizar' : 'Criar'} Edição
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabela de Edições */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Ano</th>
                  <th>Local</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {edicoes.map(edicao => (
                  <tr key={edicao.id}>
                    <td>{getEventoNome(edicao.eventoId)}</td>
                    <td><strong>{edicao.ano}</strong></td>
                    <td>{edicao.local}</td>
                    <td>
                      {new Date(edicao.dataInicio).toLocaleDateString('pt-BR')} - {' '}
                      {new Date(edicao.dataFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <span className={`status status-${edicao.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {edicao.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEditarEdicao(edicao)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleExcluirEdicao(edicao.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-info">
            <p>Total: {edicoes.length} edições</p>
          </div>
        </div>
      )}

      {/* Aba de Artigos */}
      {abaSelecionada === 'artigos' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gerenciar Artigos</h2>
            <div className="header-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setMostrarImportBibtex(true)}
              >
                📚 Importar BibTeX
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setMostrarFormularioArtigo(true)}
              >
                + Novo Artigo
              </button>
            </div>
          </div>

          {/* Formulário de Artigo */}
          {mostrarFormularioArtigo && (
            <div className="form-modal">
              <div className="form-container">
                <h3>{artigoEditando ? 'Editar Artigo' : 'Cadastrar Novo Artigo'}</h3>
                <form onSubmit={handleArtigoSubmit}>
                  <div className="form-group">
                    <label htmlFor="titulo">Título do Artigo</label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={novoArtigo.titulo}
                      onChange={handleArtigoInputChange}
                      placeholder="Digite o título completo do artigo"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="autores">Autores</label>
                      <input
                        type="text"
                        id="autores"
                        name="autores"
                        value={novoArtigo.autores}
                        onChange={handleArtigoInputChange}
                        placeholder="Nome dos autores (separados por vírgula)"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edicaoId">Edição do Evento</label>
                      <select
                        id="edicaoId"
                        name="edicaoId"
                        value={novoArtigo.edicaoId}
                        onChange={handleArtigoInputChange}
                        required
                      >
                        <option value="">Selecione uma edição</option>
                        {edicoes.map(edicao => (
                          <option key={edicao.id} value={edicao.id}>
                            {getEdicaoInfo(edicao.id)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="resumo">Resumo</label>
                    <textarea
                      id="resumo"
                      name="resumo"
                      value={novoArtigo.resumo}
                      onChange={handleArtigoInputChange}
                      placeholder="Resumo do artigo..."
                      rows="4"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="palavrasChave">Palavras-chave</label>
                      <input
                        type="text"
                        id="palavrasChave"
                        name="palavrasChave"
                        value={novoArtigo.palavrasChave}
                        onChange={handleArtigoInputChange}
                        placeholder="palavras, separadas, por, vírgula"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={novoArtigo.status}
                        onChange={handleArtigoInputChange}
                      >
                        <option value="Rascunho">Rascunho</option>
                        <option value="Em Revisão">Em Revisão</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Publicado">Publicado</option>
                        <option value="Rejeitado">Rejeitado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="arquivo">Arquivo PDF</label>
                    <input
                      type="file"
                      id="arquivo"
                      name="arquivo"
                      onChange={handleArtigoInputChange}
                      accept=".pdf"
                      className="file-input"
                    />
                    <small className="file-help">Selecione um arquivo PDF (máx. 10MB)</small>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={cancelarFormularios}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {artigoEditando ? 'Atualizar' : 'Salvar'} Artigo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Importação BibTeX */}
          {mostrarImportBibtex && (
            <div className="form-modal">
              <div className="form-container">
                <h3>Importar Artigos via BibTeX</h3>
                <form onSubmit={handleBibtexImport}>
                  <div className="form-group">
                    <label htmlFor="edicaoImport">Edição de Destino</label>
                    <select
                      id="edicaoImport"
                      name="edicaoImport"
                      required
                    >
                      <option value="">Selecione uma edição</option>
                      {edicoes.map(edicao => (
                        <option key={edicao.id} value={edicao.id}>
                          {getEdicaoInfo(edicao.id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bibtexFile">Arquivo BibTeX</label>
                    <input
                      type="file"
                      id="bibtexFile"
                      name="bibtexFile"
                      accept=".bib,.bibtex"
                      className="file-input"
                      required
                    />
                    <small className="file-help">Selecione um arquivo .bib ou .bibtex</small>
                  </div>

                  <div className="import-info">
                    <h4>ℹ️ Instruções</h4>
                    <ul>
                      <li>O arquivo deve estar no formato BibTeX padrão</li>
                      <li>Artigos duplicados serão ignorados</li>
                      <li>PDFs devem ser enviados separadamente após a importação</li>
                      <li>Todos os artigos serão marcados como "Importado"</li>
                    </ul>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={cancelarFormularios}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      📚 Importar Artigos
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabela de Artigos */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autores</th>
                  <th>Edição</th>
                  <th>Status</th>
                  <th>Arquivo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {artigos.map(artigo => (
                  <tr key={artigo.id}>
                    <td className="description-cell">{artigo.titulo}</td>
                    <td>{artigo.autores}</td>
                    <td>{getEdicaoInfo(artigo.edicaoId)}</td>
                    <td>
                      <span className={`status status-${artigo.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {artigo.status}
                      </span>
                    </td>
                    <td>
                      {artigo.arquivo && (
                        <a href="#" className="file-link">
                          📄 {artigo.arquivo}
                        </a>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEditarArtigo(artigo)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleExcluirArtigo(artigo.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-info">
            <p>Total: {artigos.length} artigos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
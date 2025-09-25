import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BuscaPage from './pages/BuscaPage';
import EventoPage from './pages/EventoPage';
import EdicaoPage from './pages/EdicaoPage';
import AutorPage from './pages/AutorPage';
import AdminPage from './pages/AdminPage';
import Admin from './pages/Admin';
import AutoresNome from './pages/AutoresNome';
import Inscrever from './pages/Inscrever';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="busca" element={<BuscaPage />} />
          <Route path="eventos/:slug" element={<EventoPage />} />
          <Route path="eventos/:slug/:ano" element={<EdicaoPage />} />
          <Route path="autor/:nomeAutor" element={<AutorPage />} />
          <Route path="admin" element={<AdminPage />} />
          {/* Mantendo outras rotas */}
          <Route path="autores/:nomeAutor" element={<AutoresNome />} />
          <Route path="inscrever" element={<Inscrever />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

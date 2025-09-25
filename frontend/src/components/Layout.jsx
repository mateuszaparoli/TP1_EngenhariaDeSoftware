import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  
  // Apenas a HomePage não precisa de limitação de largura (para o design especial)
  const isHomePage = location.pathname === '/';

  return (
    <div className="layout">
      <header className="header">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/" className="brand-link">📚 Biblioteca Digital</Link>
          </div>
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">Início</Link>
            </li>
            <li>
              <Link to="/admin" className="nav-link">Administração</Link>
            </li>
            <li>
              <Link to="/inscrever" className="nav-link inscrever-btn">
                📧 Inscrever-se
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className={`main-content ${!isHomePage ? 'standard-page' : ''}`}>
        <Outlet />
      </main>
      
      <footer className="footer">
        <p>&copy; 2025 Biblioteca Digital - Artigos Científicos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;
import React from 'react';
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage-layout">
      <aside className="homepage-sidebar">
        <div className="sidebar-logo">BP</div>
        <nav className="sidebar-nav">
          <a href="#" className="active">Papers</a>
          <a href="#">My Library</a>
          <a href="#">Profile</a>
        </nav>
      </aside>
      <div className="homepage-main">
        <header className="homepage-header">
          <h1 className="homepage-title">BluePapers</h1>
          <div className="homepage-search">
            <input type="text" placeholder="Search for papers..." disabled />
          </div>
        </header>
        <section className="homepage-table-section">
          <h2>Papers</h2>
          <table className="homepage-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Year</th>
                <th>Edition/Event</th>
              </tr>
            </thead>
            <tbody>
              {/* Example rows, replace with dynamic data later */}
              <tr>
                <td>Deep Learning for Science</td>
                <td>Jane Doe, John Smith</td>
                <td>2025</td>
                <td>ICML 2025</td>
              </tr>
              <tr>
                <td>Quantum Computing Advances</td>
                <td>Alice Brown</td>
                <td>2024</td>
                <td>QCE 2024</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default HomePage;

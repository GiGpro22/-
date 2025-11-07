import '../App.css';

function Dashboard() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="shop-title">Golden Flower</h1>
        <p className="shop-subtitle">Цветочный магазин</p>
      </header>
      <main className="dashboard-container">
        <div className="dashboard-content">
          <p className="dashboard-text">
            Выберите раздел в панели
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;


import '../App.css';

function Dashboard() {
  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Golden Flower</h1>
        <p className="podzagolovok">Цветочный магазин</p>
      </header>
      <main className="konteyner_dashborda">
        <div className="soderzhimoe_dashborda">
          <p className="tekst_dashborda">
            Выберите раздел в панели
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;


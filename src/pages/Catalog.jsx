import ProductCard from '../components/ProductCard';
import '../App.css';
import bouquet1 from '../assets/images/bouquet1.jpg';
import bouquet2 from '../assets/images/bouquet2.jpg';
import bouquet3 from '../assets/images/bouquet3.jpg';
import bouquet4 from '../assets/images/bouquet4.jpg';
import bouquet5 from '../assets/images/bouquet5.jpg';
import bouquet6 from '../assets/images/bouquet6.jpg';

function Catalog() {
  const products = [
    {
      id: 1,
      name: 'Радужные розы',
      price: 1500,
      image: bouquet1
    },
    {
      id: 2,
      name: 'Корзина с розами',
      price: 1800,
      image: bouquet2
    },
    {
      id: 3,
      name: 'Белые розы',
      price: 1200,
      image: bouquet3
    },
    {
      id: 4,
      name: 'Букет тюльпанов',
      price: 900,
      image: bouquet4
    },
    {
      id: 5,
      name: 'Композиция из пионов',
      price: 2200,
      image: bouquet5
    },
    {
      id: 6,
      name: 'Букет гвоздик',
      price: 800,
      image: bouquet6
    }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="shop-title">Golden Flower</h1>
        <p className="shop-subtitle">Цветочный магазин</p>
      </header>
      <main className="products-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </main>
    </div>
  );
}

export default Catalog;


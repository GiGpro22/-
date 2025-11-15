import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import './ProductCard.css';

function ProductCard({ id, nazvanie, cena, izobrazhenie, opisanie, dlitelnost, skidka = 0 }) {
  const { dobavitVKorzinu, korzina } = useCart();
  const { polzovatel } = useUser();
  
  // проверяю есть ли этот товар в корзине, чтобы показать количество
  const kolichestvo = korzina.tovary.find(tovar => tovar.id === id)?.kolichestvo || 0;
  
  // считаю цену со скидкой если она есть
  const pervobytnayaCena = parseFloat(cena);
  const summaSkidki = (pervobytnayaCena * skidka) / 100;
  const finalnayaCena = pervobytnayaCena - summaSkidki;

  const obrabotatNazhatie = () => {
    dobavitVKorzinu({ id, nazvanie, cena: pervobytnayaCena, izobrazhenie }, polzovatel?.id || null);
  };

  return (
    <div className="kartochka_tovara">
      {skidka > 0 && (
        <div className="badge_skidka">-{skidka}%</div>
      )}
      <div className="foto_tovara">
        <img src={izobrazhenie} alt={nazvanie} />
      </div>
      <div className="info_tovara">
        <h3 className="nazvanie_tovara">{nazvanie}</h3>
        {opisanie && <p className="opisanie_tovara">{opisanie}</p>}
        {dlitelnost && <p className="dlitelnost_tovara">Длительность: {dlitelnost} мин</p>}
        <div className="cena_blok">
          {skidka > 0 ? (
            <>
              <span className="cena_staraya">{pervobytnayaCena.toFixed(2)} ₽</span>
              <span className="cena_tovara">{finalnayaCena.toFixed(2)} ₽</span>
            </>
          ) : (
            <span className="cena_tovara">{pervobytnayaCena.toFixed(2)} ₽</span>
          )}
        </div>
        <div className="knopki_tovara">
          <button className="knopka_dobavit" onClick={obrabotatNazhatie}>
            Добавить в корзину
          </button>
          {kolichestvo > 0 && (
            <div className="badge_kolichestvo">
              {kolichestvo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;


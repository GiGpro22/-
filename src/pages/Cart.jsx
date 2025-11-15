import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { sozdatZakaz } from '../api/orders';
import { poluchitKuponyPolzovatelya } from '../api/discounts';
import '../App.css';

function Cart() {
  const { korzina, udalitIzKorzini, poluchitObshuyuCenu, zagruzitKorzinu, ochistitKorzinu, zagruzka, oshibka, informaciyaOSkidkah } = useCart();
  const { polzovatel } = useUser();
  const navigate = useNavigate();
  
  const [pokazyvatFormuZakaza, setPokazyvatFormuZakaza] = useState(false);
  const [formaZakaza, setFormaZakaza] = useState({
    adresDostavki: '',
    sposobOplaty: 'cash',
    kodKupona: ''
  });
  const [dostupnyeKupony, setDostupnyeKupony] = useState([]);
  const [zagruzkaZakaza, setZagruzkaZakaza] = useState(false);
  const [uspehZakaza, setUspehZakaza] = useState(null);
  const [oshibkaZakaza, setOshibkaZakaza] = useState(null);

  useEffect(() => {
    zagruzitKorzinu(polzovatel?.id || null);
    
    // если пользователь залогинен, загружаю его купоны
    if (polzovatel?.id) {
      zagruzitKupony();
    }
  }, [polzovatel?.id]);

  const zagruzitKupony = async () => {
    try {
      const kupony = await poluchitKuponyPolzovatelya(polzovatel.id);
      setDostupnyeKupony(kupony.filter(k => k.is_active && !k.used_at));
    } catch (err) {
      console.error('Ошибка загрузки купонов:', err);
    }
  };

  const obrabotatOtpravkuZakaza = async (e) => {
    e.preventDefault();
    
    if (!polzovatel) {
      setOshibkaZakaza('Для оформления заказа необходимо войти в систему');
      navigate('/login');
      return;
    }

    try {
      setZagruzkaZakaza(true);
      setOshibkaZakaza(null);
      
      const dannyeZakaza = {
        userId: polzovatel.id,
        cartId: korzina.idKorzini,
        deliveryAddress: formaZakaza.adresDostavki || null,
        paymentMethod: formaZakaza.sposobOplaty,
        couponCode: formaZakaza.kodKupona || null
      };
      
      const rezultat = await sozdatZakaz(dannyeZakaza);
      
      setUspehZakaza({
        orderNumber: rezultat.order.orderNumber,
        totalCost: rezultat.order.totalCost
      });
      
      // чищу форму после успешного заказа
      setFormaZakaza({
        adresDostavki: '',
        sposobOplaty: 'cash',
        kodKupona: ''
      });
      
      // обновляю корзину (она уже будет пустая после заказа)
      await zagruzitKorzinu(polzovatel.id);
      
      // через 3 секунды скрываю форму
      setTimeout(() => {
        setPokazyvatFormuZakaza(false);
        setUspehZakaza(null);
      }, 5000);
      
    } catch (err) {
      setOshibkaZakaza(err.message || 'Ошибка при оформлении заказа');
    } finally {
      setZagruzkaZakaza(false);
    }
  };

  if (zagruzka) {
    return (
      <div className="glavnaya_stranica">
        <p>Загрузка корзины...</p>
      </div>
    );
  }

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Корзина</h1>
        {korzina.tovary.length === 0 && <p className="podzagolovok">Ваша корзина пуста</p>}
      </header>
      
      {oshibka && (
        <div style={{ 
          color: 'red', 
          margin: '20px auto',
          maxWidth: '800px',
          padding: '10px',
          background: '#ffebee',
          borderRadius: '4px'
        }}>
          Ошибка: {oshibka}
        </div>
      )}

      {uspehZakaza && (
        <div style={{ 
          color: 'green', 
          margin: '20px auto',
          maxWidth: '800px',
          padding: '15px',
          background: '#e8f5e9',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Заказ успешно оформлен!</h3>
          <p style={{ margin: '5px 0' }}>Номер заказа: <strong>{uspehZakaza.orderNumber}</strong></p>
          <p style={{ margin: '5px 0' }}>Сумма: <strong>{uspehZakaza.totalCost} ₽</strong></p>
        </div>
      )}

      {oshibkaZakaza && (
        <div style={{ 
          color: 'red', 
          margin: '20px auto',
          maxWidth: '800px',
          padding: '10px',
          background: '#ffebee',
          borderRadius: '4px'
        }}>
          Ошибка: {oshibkaZakaza}
        </div>
      )}

      {korzina.tovary.length > 0 && (
        <main className="konteyner_korzini">
          <div className="spisok_tovarov">
            {korzina.tovary.map(tovar => (
              <div key={tovar.idElementaKorzini || tovar.id} className="element_korzini">
                <div className="info_elementa">
                  <h3 className="nazvanie_elementa">{tovar.nazvanie}</h3>
                  <p className="cena_elementa">
                    {tovar.cena.toFixed(2)} ₽ × {tovar.kolichestvo} = {(tovar.cena * tovar.kolichestvo).toFixed(2)} ₽
                  </p>
                </div>
                <button 
                  className="knopka_udalit" 
                  onClick={() => udalitIzKorzini(tovar.idElementaKorzini, polzovatel?.id || null)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
          
          <div className="blok_itogo">
            <div className="raschet_skidok">
              <div className="stroka_rascheta">
                <span>Сумма товаров:</span>
                <span>{informaciyaOSkidkah ? informaciyaOSkidkah.totalAmount.toFixed(2) : poluchitObshuyuCenu()} ₽</span>
              </div>
              
              {informaciyaOSkidkah && informaciyaOSkidkah.itemDiscounts && informaciyaOSkidkah.itemDiscounts.length > 0 && (
                <div className="stroka_rascheta skidka">
                  <span>Скидки на товары:</span>
                  <span>-{informaciyaOSkidkah.itemDiscounts.reduce((suma, tovar) => suma + tovar.discountAmount, 0).toFixed(2)} ₽</span>
                </div>
              )}
              
              {informaciyaOSkidkah && informaciyaOSkidkah.personalDiscount > 0 && (
                <div className="stroka_rascheta skidka">
                  <span>Персональная скидка ({informaciyaOSkidkah.personalDiscount}%):</span>
                  <span>-{informaciyaOSkidkah.personalDiscountAmount.toFixed(2)} ₽</span>
                </div>
              )}
              
              {informaciyaOSkidkah && informaciyaOSkidkah.totalDiscount > 0 && (
                <div className="stroka_rascheta obshaya_skidka">
                  <span>Общая скидка:</span>
                  <span>-{informaciyaOSkidkah.totalDiscount.toFixed(2)} ₽</span>
                </div>
              )}
            </div>
            
            <div className="blok_finalnoy_ceny">
              <p className="nadpis_itogo">Итого:</p>
              <p className="cena_itogo">{poluchitObshuyuCenu()} ₽</p>
            </div>
          </div>

          {/* Кнопка оформления заказа */}
          {!pokazyvatFormuZakaza && !uspehZakaza && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              {!polzovatel ? (
                <div>
                  <p style={{ marginBottom: '15px', color: 'var(--subtitle-color)' }}>
                    Для оформления заказа необходимо войти в систему
                  </p>
                  <button 
                    className="knopka_vhod"
                    onClick={() => navigate('/login')}
                    style={{ padding: '12px 30px', fontSize: '1.1rem' }}
                  >
                    Войти
                  </button>
                </div>
              ) : (
                <button 
                  className="knopka_vhod"
                  onClick={() => setPokazyvatFormuZakaza(true)}
                  style={{ padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                  Оформить заказ
                </button>
              )}
            </div>
          )}

          {/* Форма оформления заказа */}
          {pokazyvatFormuZakaza && !uspehZakaza && (
            <div style={{ 
              marginTop: '30px', 
              padding: '25px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0 }}>Оформление заказа</h2>
              <form onSubmit={obrabotatOtpravkuZakaza} className="admin_form">
                <div className="gruppa_polya">
                  <label htmlFor="deliveryAddress">Адрес доставки</label>
                  <textarea
                    id="deliveryAddress"
                    value={formaZakaza.adresDostavki}
                    onChange={(e) => setFormaZakaza({ ...formaZakaza, adresDostavki: e.target.value })}
                    placeholder="Укажите адрес доставки (необязательно)"
                    rows="3"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      fontSize: '1rem',
                      background: 'var(--bg-color)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>

                {dostupnyeKupony.length > 0 && (
                  <div className="gruppa_polya">
                    <label htmlFor="couponCode">Код купона (необязательно)</label>
                    <select
                      id="couponCode"
                      value={formaZakaza.kodKupona}
                      onChange={(e) => setFormaZakaza({ ...formaZakaza, kodKupona: e.target.value })}
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    >
                      <option value="">Не использовать купон</option>
                      {dostupnyeKupony.map(kupon => (
                        <option key={kupon.id_user_coupon} value={kupon.coupon_code}>
                          {kupon.coupon_code} - скидка {kupon.discount}%
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="gruppa_polya">
                  <label htmlFor="paymentMethod">Способ оплаты</label>
                  <select
                    id="paymentMethod"
                    value={formaZakaza.sposobOplaty}
                    onChange={(e) => setFormaZakaza({ ...formaZakaza, sposobOplaty: e.target.value })}
                    required
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      background: 'var(--bg-color)',
                      color: 'var(--text-color)'
                    }}
                  >
                    <option value="cash">Наличными при получении</option>
                    <option value="card">Банковской картой</option>
                    <option value="online">Онлайн оплата</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    className="knopka_vhod"
                    disabled={zagruzkaZakaza}
                    style={{ flex: 1, padding: '12px', fontSize: '1.1rem' }}
                  >
                    {zagruzkaZakaza ? 'Оформление...' : 'Подтвердить заказ'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setPokazyvatFormuZakaza(false);
                      setOshibkaZakaza(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default Cart;

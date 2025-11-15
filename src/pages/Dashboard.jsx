import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { poluchitKategorii } from '../api/categories';
import { poluchitTovary } from '../api/services';
import { poluchitPolzovateley, poluchitZakazy } from '../api/admin';
import { sozdatKategoriyu, obnovitKategoriyu, udalitKategoriyu } from '../api/admin';
import { sozdatTovar, obnovitTovar, udalitTovar } from '../api/admin';
import { ustanovitSkidkuPolzovatelya, ustanovitSkidkuNaTovar, sozdatKupon } from '../api/admin';
import '../App.css';

function Dashboard() {
  const { polzovatel } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // состояние для работы с категориями
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ title: '', slug: '', is_active: true, display_order: 0 });
  const [editingCategory, setEditingCategory] = useState(null);

  // состояние для работы с товарами
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({ 
    category_id: '', title: '', description: '', duration: '', price: '', discount: 0, product_image: '', is_active: true 
  });
  const [editingService, setEditingService] = useState(null);

  // состояние для работы с пользователями
  const [users, setUsers] = useState([]);
  const [userDiscountForm, setUserDiscountForm] = useState({ userId: '', discount: '' });
  const [couponForm, setCouponForm] = useState({ userId: '', coupon_code: '', discount: '' });

  // состояние для заказов
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!polzovatel) {
      navigate('/login');
      return;
    }

    // проверяю что пользователь администратор
    const isAdmin = polzovatel.roleTitle && (
      polzovatel.roleTitle.toLowerCase().includes('admin') || 
      polzovatel.roleTitle.toLowerCase().includes('админ')
    );

    if (!isAdmin) {
      // если не админ, отправляю на главную
      navigate('/');
      return;
    }

    loadData();
  }, [polzovatel, activeTab, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'categories') {
        const data = await poluchitKategorii();
        setCategories(data);
      } else if (activeTab === 'services') {
        const data = await poluchitTovary();
        setServices(data);
        const cats = await poluchitKategorii();
        setCategories(cats);
      } else if (activeTab === 'users') {
        const data = await poluchitPolzovateley();
        setUsers(data);
      } else if (activeTab === 'appointments') {
        const data = await poluchitZakazy();
        setAppointments(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // работа с категориями

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingCategory) {
        await obnovitKategoriyu(editingCategory.id_category, categoryForm);
      } else {
        await sozdatKategoriyu(categoryForm);
      }
      setCategoryForm({ title: '', slug: '', is_active: true, display_order: 0 });
      setEditingCategory(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      title: category.title,
      slug: category.slug,
      is_active: category.is_active,
      display_order: category.display_order
    });
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    try {
      await udalitKategoriyu(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // работа с товарами

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const serviceData = {
        ...serviceForm,
        category_id: parseInt(serviceForm.category_id),
        duration: parseInt(serviceForm.duration),
        price: parseFloat(serviceForm.price),
        discount: parseFloat(serviceForm.discount) || 0
      };

      if (editingService) {
        await obnovitTovar(editingService.id_product, serviceData);
      } else {
        await sozdatTovar(serviceData);
      }
      setServiceForm({ category_id: '', title: '', description: '', duration: '', price: '', discount: 0, product_image: '', is_active: true });
      setEditingService(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleServiceEdit = (service) => {
    setEditingService(service);
    setServiceForm({
      category_id: service.category_id.toString(),
      title: service.title,
      description: service.description || '',
      duration: service.duration.toString(),
      price: service.price.toString(),
      discount: service.discount || 0,
      product_image: service.product_image || '',
      is_active: service.is_active
    });
  };

  const handleServiceDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await udalitTovar(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // работа со скидками

  const handleUserDiscountSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ustanovitSkidkuPolzovatelya(userDiscountForm.userId, parseFloat(userDiscountForm.discount));
      setUserDiscountForm({ userId: '', discount: '' });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await sozdatKupon(couponForm.userId, couponForm.coupon_code, parseFloat(couponForm.discount));
      setCouponForm({ userId: '', coupon_code: '', discount: '' });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleServiceDiscountSubmit = async (serviceId, discount) => {
    try {
      setError(null);
      await ustanovitSkidkuNaTovar(serviceId, parseFloat(discount));
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!polzovatel) {
    return null;
  }

  // еще раз проверяю что пользователь админ
  const isAdmin = polzovatel.roleTitle && (
    polzovatel.roleTitle.toLowerCase().includes('admin') || 
    polzovatel.roleTitle.toLowerCase().includes('админ')
  );

  if (!isAdmin) {
    return (
      <div className="glavnaya_stranica">
        <header className="zagolovok_stranicy">
          <h1 className="nazvanie_magazina">Доступ запрещен</h1>
          <p className="podzagolovok">У вас нет прав для доступа к этой странице</p>
        </header>
      </div>
    );
  }

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Панель администратора</h1>
        <p className="podzagolovok">Управление магазином</p>
      </header>

      {error && (
        <div className="soobshchenie_obshibke" style={{ 
          color: 'red', 
          margin: '20px auto',
          maxWidth: '1200px',
          padding: '15px',
          background: '#ffebee',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      <div className="admin_panel">
        {/* Вкладки */}
        <div className="admin_tabs">
          <button 
            className={activeTab === 'categories' ? 'admin_tab active' : 'admin_tab'}
            onClick={() => setActiveTab('categories')}
          >
            Категории
          </button>
          <button 
            className={activeTab === 'services' ? 'admin_tab active' : 'admin_tab'}
            onClick={() => setActiveTab('services')}
          >
            Товары
          </button>
          <button 
            className={activeTab === 'users' ? 'admin_tab active' : 'admin_tab'}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
          <button 
            className={activeTab === 'appointments' ? 'admin_tab active' : 'admin_tab'}
            onClick={() => setActiveTab('appointments')}
          >
            Заказы
          </button>
        </div>

        {/* Контент */}
        <div className="admin_content">
          {loading && <p>Загрузка...</p>}

          {/* КАТЕГОРИИ */}
          {activeTab === 'categories' && (
            <div>
              <h2>{editingCategory ? 'Редактировать категорию' : 'Создать категорию'}</h2>
              <form onSubmit={handleCategorySubmit} className="admin_form">
                <input
                  type="text"
                  placeholder="Название"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (например: roses)"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Порядок отображения"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  />
                  Активна
                </label>
                <button type="submit">{editingCategory ? 'Обновить' : 'Создать'}</button>
                {editingCategory && (
                  <button type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ title: '', slug: '', is_active: true, display_order: 0 }); }}>
                    Отмена
                  </button>
                )}
              </form>

              <h2>Список категорий</h2>
              {categories.length === 0 ? (
                <p style={{ color: 'var(--subtitle-color)', padding: '20px' }}>Категорий пока нет</p>
              ) : (
                <div className="admin_list">
                  {categories.map(cat => (
                  <div key={cat.id_category} className="admin_item">
                    <div>
                      <strong>{cat.title}</strong> ({cat.slug})
                      {!cat.is_active && <span style={{ color: 'red', marginLeft: '10px' }}>Неактивна</span>}
                    </div>
                    <div>
                      <button onClick={() => handleCategoryEdit(cat)}>Редактировать</button>
                      <button onClick={() => handleCategoryDelete(cat.id_category)} style={{ marginLeft: '10px', background: 'red' }}>
                        Удалить
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ТОВАРЫ */}
          {activeTab === 'services' && (
            <div>
              <h2>{editingService ? 'Редактировать товар' : 'Создать товар'}</h2>
              <form onSubmit={handleServiceSubmit} className="admin_form">
                <select
                  value={serviceForm.category_id}
                  onChange={(e) => setServiceForm({ ...serviceForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id_category} value={cat.id_category}>{cat.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Название"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Описание"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Длительность (мин)"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Цена"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Скидка (%)"
                  value={serviceForm.discount}
                  onChange={(e) => setServiceForm({ ...serviceForm, discount: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL изображения"
                  value={serviceForm.product_image}
                  onChange={(e) => setServiceForm({ ...serviceForm, product_image: e.target.value })}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={serviceForm.is_active}
                    onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                  />
                  Активна
                </label>
                <button type="submit">{editingService ? 'Обновить' : 'Создать'}</button>
                {editingService && (
                  <button type="button" onClick={() => { setEditingService(null); setServiceForm({ category_id: '', title: '', description: '', duration: '', price: '', discount: 0, product_image: '', is_active: true }); }}>
                    Отмена
                  </button>
                )}
              </form>

              <h2>Список товаров</h2>
              {services.length === 0 ? (
                <p style={{ color: 'var(--subtitle-color)', padding: '20px' }}>Товаров пока нет</p>
              ) : (
                <div className="admin_list">
                  {services.map(service => (
                  <div key={service.id_product} className="admin_item">
                    <div>
                      <strong>{service.title}</strong> - {service.price} ₽
                      {service.discount > 0 && <span style={{ color: 'green', marginLeft: '10px' }}>Скидка: {service.discount}%</span>}
                      {!service.is_active && <span style={{ color: 'red', marginLeft: '10px' }}>Неактивна</span>}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Скидка %"
                        style={{ width: '80px', marginRight: '10px' }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleServiceDiscountSubmit(service.id_product, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button onClick={() => handleServiceEdit(service)}>Редактировать</button>
                      <button onClick={() => handleServiceDelete(service.id_product)} style={{ marginLeft: '10px', background: 'red' }}>
                        Удалить
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ПОЛЬЗОВАТЕЛИ */}
          {activeTab === 'users' && (
            <div>
              <h2>Установить персональную скидку</h2>
              <form onSubmit={handleUserDiscountSubmit} className="admin_form">
                <select
                  value={userDiscountForm.userId}
                  onChange={(e) => setUserDiscountForm({ ...userDiscountForm, userId: e.target.value })}
                  required
                >
                  <option value="">Выберите пользователя</option>
                  {users.map(u => (
                    <option key={u.id_user} value={u.id_user}>
                      {u.email} {u.first_name} {u.last_name} (Персональная скидка: {u.personal_discount || 0}%)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Скидка (%)"
                  value={userDiscountForm.discount}
                  onChange={(e) => setUserDiscountForm({ ...userDiscountForm, discount: e.target.value })}
                  required
                />
                <button type="submit">Установить скидку</button>
              </form>

              <h2>Выдать купон</h2>
              <form onSubmit={handleCouponSubmit} className="admin_form">
                <select
                  value={couponForm.userId}
                  onChange={(e) => setCouponForm({ ...couponForm, userId: e.target.value })}
                  required
                >
                  <option value="">Выберите пользователя</option>
                  {users.map(u => (
                    <option key={u.id_user} value={u.id_user}>
                      {u.email} {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Код купона"
                  value={couponForm.coupon_code}
                  onChange={(e) => setCouponForm({ ...couponForm, coupon_code: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Скидка (%)"
                  value={couponForm.discount}
                  onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                  required
                />
                <button type="submit">Выдать купон</button>
              </form>

              <h2>Список пользователей</h2>
              {users.length === 0 ? (
                <p style={{ color: 'var(--subtitle-color)', padding: '20px' }}>Пользователей пока нет</p>
              ) : (
                <div className="admin_list">
                  {users.map(u => (
                  <div key={u.id_user} className="admin_item">
                    <div>
                      <strong>{u.email}</strong> - {u.first_name} {u.last_name}
                      <br />
                      Роль: {u.role_title} | Персональная скидка: {u.personal_discount || 0}%
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ЗАКАЗЫ */}
          {activeTab === 'appointments' && (
            <div>
              <h2>Список заказов</h2>
              {!loading && appointments.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: 'var(--subtitle-color)',
                  background: 'var(--bg-color)',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Заказов пока нет</p>
                  <p style={{ fontSize: '0.9rem' }}>Когда пользователи будут оформлять заказы, они появятся здесь</p>
                </div>
              ) : (
                <div className="admin_list">
                  {appointments.map(apt => {
                    // парсю товары из заказа, если они в виде строки JSON
                    let items = [];
                    try {
                      items = typeof apt.items === 'string' ? JSON.parse(apt.items) : (apt.items || []);
                    } catch (e) {
                      items = [];
                    }
                    
                    return (
                      <div key={apt.id_order} className="admin_item">
                        <div>
                          <strong>Заказ #{apt.order_number}</strong>
                          <br />
                          Пользователь: {apt.email} ({apt.first_name} {apt.last_name})
                          <br />
                          Сумма: {apt.total_cost} ₽ | Скидка: {apt.discount || 0}% | Статус: {apt.order_status}
                          <br />
                          Товаров: {apt.items_count} | Дата: {new Date(apt.created_at).toLocaleString('ru-RU')}
                          {apt.delivery_address && (
                            <>
                              <br />
                              Адрес доставки: {apt.delivery_address}
                            </>
                          )}
                          {apt.coupon_code && (
                            <>
                              <br />
                              Использован купон: {apt.coupon_code}
                            </>
                          )}
                          {items.length > 0 && (
                            <>
                              <br />
                              <br />
                              <div style={{ 
                                marginTop: '10px', 
                                padding: '10px', 
                                background: 'rgba(255, 255, 255, 0.05)', 
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}>
                                <strong style={{ color: 'var(--primary-color)' }}>Товары в заказе:</strong>
                                <ul style={{ 
                                  marginTop: '8px', 
                                  marginLeft: '20px', 
                                  padding: 0,
                                  listStyle: 'none'
                                }}>
                                  {items.map((item, idx) => (
                                    <li key={item.id || idx} style={{ 
                                      marginBottom: '5px',
                                      padding: '5px 0',
                                      borderBottom: idx < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                                    }}>
                                      <span style={{ color: 'var(--primary-color)' }}>•</span> {item.product_title || 'Товар #' + item.product_id} 
                                      {' '}× {item.quantity} 
                                      {' '}— {parseFloat(item.price).toFixed(2)} ₽
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

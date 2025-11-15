import API_URL from './config';

// достаю id пользователя из localStorage для админки
function poluchitIdPolzovatelya() {
  const polzovatel = localStorage.getItem('user');
  if (polzovatel) {
    return JSON.parse(polzovatel).id;
  }
  return null;
}

// добавляю userId к url запроса, нужно для всех админских запросов
function dobavitIdPolzovatelya(url) {
  const idPolzovatelya = poluchitIdPolzovatelya();
  if (!idPolzovatelya) {
    throw new Error('Требуется авторизация');
  }
  return `${url}${url.includes('?') ? '&' : '?'}userId=${idPolzovatelya}`;
}

// работа с категориями в админке

// создаю новую категорию
export async function sozdatKategoriyu(kategoriya) {
  try {
    const url = dobavitIdPolzovatelya(`${API_URL}/admin/categories`);
    console.log('отправляю запрос на создание категории:', url);
    
    const otvet = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kategoriya),
    });
    
    console.log('сервер ответил со статусом:', otvet.status);
    
    const tipSoderzhimogo = otvet.headers.get('content-type');
    let dannye;
    
    // проверяю формат ответа от сервера
    if (tipSoderzhimogo && tipSoderzhimogo.includes('application/json')) {
      dannye = await otvet.json();
    } else {
      const tekst = await otvet.text();
      console.error('сервер вернул не JSON:', tekst.substring(0, 200));
      throw new Error(`Сервер вернул не JSON. Статус: ${otvet.status}. Проверьте, что backend сервер запущен и маршрут /api/admin/categories существует.`);
    }
    
    if (!otvet.ok) {
      throw new Error(dannye.error || `Ошибка ${otvet.status}: Ошибка при создании категории`);
    }
    
    return dannye;
  } catch (oshibka) {
    console.error('не получилось создать категорию:', oshibka);
    throw oshibka;
  }
}

// обновляю существующую категорию
export async function obnovitKategoriyu(id, kategoriya) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/categories/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kategoriya),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при обновлении категории');
  }
  return await otvet.json();
}

// удаляю категорию
export async function udalitKategoriyu(id) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/categories/${id}`), {
    method: 'DELETE',
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при удалении категории');
  }
  return await otvet.json();
}

// работа с товарами в админке

// создаю новый товар
export async function sozdatTovar(tovar) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/services`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tovar),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при создании товара');
  }
  return await otvet.json();
}

// обновляю существующий товар
export async function obnovitTovar(id, tovar) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/services/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tovar),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при обновлении товара');
  }
  return await otvet.json();
}

// удаляю товар
export async function udalitTovar(id) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/services/${id}`), {
    method: 'DELETE',
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при удалении товара');
  }
  return await otvet.json();
}

// работа со скидками в админке

// устанавливаю персональную скидку для пользователя
export async function ustanovitSkidkuPolzovatelya(idPolzovatelya, skidka) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/users/${idPolzovatelya}/discount`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personal_discount: skidka }),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при установке скидки');
  }
  return await otvet.json();
}

// устанавливаю скидку на конкретный товар
export async function ustanovitSkidkuNaTovar(idTovara, skidka) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/services/${idTovara}/discount`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discount: skidka }),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при установке скидки');
  }
  return await otvet.json();
}

// создаю купон для пользователя с определенной скидкой
export async function sozdatKupon(idPolzovatelya, kodKupona, skidka) {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/users/${idPolzovatelya}/coupons`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupon_code: kodKupona, discount: skidka }),
  });
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при создании купона');
  }
  return await otvet.json();
}

// работа с пользователями

// получаю список всех пользователей для админки
export async function poluchitPolzovateley() {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/users`));
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при получении пользователей');
  }
  return await otvet.json();
}

// работа с заказами

// получаю все заказы для просмотра в админке
export async function poluchitZakazy() {
  const otvet = await fetch(dobavitIdPolzovatelya(`${API_URL}/admin/appointments`));
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при получении заказов');
  }
  return await otvet.json();
}


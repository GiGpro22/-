import API_URL from './config';

// получаю корзину с сервера, могу по id пользователя или по session id
export async function poluchitKorzinu(idPolzovatelya = null, idSessii = null) {
  let url = `${API_URL}/cart?`;
  
  if (idPolzovatelya) {
    url += `user_id=${idPolzovatelya}`;
  } else if (idSessii) {
    url += `session_id=${idSessii}`;
  }
  
  const otvet = await fetch(url);
  if (!otvet.ok) throw new Error('Ошибка при получении корзины');
  return await otvet.json();
}

// добавляю товар в корзину через API
export async function dobavitVKorzinu(dannyeKorzini) {
  const otvet = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dannyeKorzini),
  });
  if (!otvet.ok) throw new Error('Ошибка при добавлении в корзину');
  return await otvet.json();
}

// удаляю товар из корзины по его id
export async function udalitIzKorzini(idElementa) {
  const otvet = await fetch(`${API_URL}/cart/item/${idElementa}`, {
    method: 'DELETE',
  });
  if (!otvet.ok) throw new Error('Ошибка при удалении из корзины');
  return await otvet.json();
}

// полностью очищаю корзину
export async function ochistitKorzinu(idKorzini) {
  const otvet = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId: idKorzini }),
  });
  if (!otvet.ok) throw new Error('Ошибка при очистке корзины');
  return await otvet.json();
}





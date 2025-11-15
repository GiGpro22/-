import API_URL from './config';

// получаю все купоны пользователя, которые он может использовать
export async function poluchitKuponyPolzovatelya(idPolzovatelya) {
  const otvet = await fetch(`${API_URL}/discounts/user/${idPolzovatelya}/coupons`);
  if (!otvet.ok) throw new Error('Ошибка при получении купонов');
  return await otvet.json();
}

// считаю все скидки для корзины: персональные, на товары, купоны
export async function rasschitatSkidki(idPolzovatelya, tovaryKorzini) {
  const otvet = await fetch(`${API_URL}/discounts/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: idPolzovatelya || null, cartItems: tovaryKorzini }),
  });
  if (!otvet.ok) throw new Error('Ошибка при расчете скидок');
  return await otvet.json();
}


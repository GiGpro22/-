import API_URL from './config';

// создаю заказ из товаров в корзине
export async function sozdatZakaz(dannyeZakaza) {
  try {
    const otvet = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dannyeZakaza),
    });
    
    const tipSoderzhimogo = otvet.headers.get('content-type');
    let dannye;
    
    // смотрю что сервер мне вернул
    if (tipSoderzhimogo && tipSoderzhimogo.includes('application/json')) {
      dannye = await otvet.json();
    } else {
      const tekst = await otvet.text();
      console.error('сервер прислал не JSON:', tekst.substring(0, 200));
      throw new Error(`Сервер вернул не JSON. Статус: ${otvet.status}. Проверьте, что backend сервер запущен и маршрут /api/orders существует.`);
    }
    
    if (!otvet.ok) {
      throw new Error(dannye.error || `Ошибка ${otvet.status}: Ошибка при создании заказа`);
    }
    
    return dannye;
  } catch (oshibka) {
    console.error('не смог создать заказ:', oshibka);
    
    // если сервер не отвечает, пишу что нужно проверить
    if (oshibka.message.includes('Failed to fetch') || oshibka.message.includes('NetworkError')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend сервер запущен на http://localhost:3001');
    }
    
    throw oshibka;
  }
}

// получаю все заказы конкретного пользователя
export async function poluchitZakazyPolzovatelya(idPolzovatelya) {
  const otvet = await fetch(`${API_URL}/orders/user/${idPolzovatelya}`);
  if (!otvet.ok) throw new Error('Ошибка при получении заказов');
  return await otvet.json();
}


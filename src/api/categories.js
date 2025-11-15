import API_URL from './config';

// получаю все категории с сервера
export async function poluchitKategorii() {
  const otvet = await fetch(`${API_URL}/categories`);
  if (!otvet.ok) throw new Error('Ошибка при получении категорий');
  return await otvet.json();
}

// создаю новую категорию, используется только в админке
export async function sozdatKategoriyu(kategoriya) {
  const otvet = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kategoriya),
  });
  if (!otvet.ok) throw new Error('Ошибка при создании категории');
  return await otvet.json();
}





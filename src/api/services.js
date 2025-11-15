import API_URL from './config';

// получаю все товары, можно указать id категорий для фильтрации
export async function poluchitTovary(idKategoriy = null) {
  let url = `${API_URL}/services`;
  
  // если указаны категории, добавляю их к url как параметр
  if (idKategoriy && idKategoriy.length > 0) {
    const id = Array.isArray(idKategoriy) ? idKategoriy.join(',') : idKategoriy;
    url += `?category_ids=${id}`;
  }
  
  const otvet = await fetch(url);
  if (!otvet.ok) throw new Error('Ошибка при получении товаров');
  return await otvet.json();
}

// получаю один товар по его id
export async function poluchitTovarPoId(id) {
  const otvet = await fetch(`${API_URL}/services/${id}`);
  if (!otvet.ok) throw new Error('Ошибка при получении товара');
  return await otvet.json();
}





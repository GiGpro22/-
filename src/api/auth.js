import API_URL from './config';

// регистрирую нового пользователя, отправляю его данные на сервер
export async function zaregistrirovat(dannyePolzovatelya) {
  try {
    const url = `${API_URL}/auth/register`;
    console.log('отправляю запрос на регистрацию:', url);
    
    const otvet = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dannyePolzovatelya),
    });
    
    console.log('сервер вернул статус:', otvet.status);
    
    const tipSoderzhimogo = otvet.headers.get('content-type');
    let dannye;
    
    // проверяю что сервер действительно вернул JSON
    if (tipSoderzhimogo && tipSoderzhimogo.includes('application/json')) {
      dannye = await otvet.json();
    } else {
      const tekst = await otvet.text();
      console.error('сервер вернул не JSON:', tekst.substring(0, 200));
      throw new Error(`Сервер вернул не JSON. Статус: ${otvet.status}. Проверьте, что backend сервер запущен.`);
    }
    
    // если ошибка, бросаю исключение
    if (!otvet.ok) {
      throw new Error(dannye.error || `Ошибка ${otvet.status}: Ошибка при регистрации`);
    }
    
    return dannye;
  } catch (oshibka) {
    console.error('что-то пошло не так при регистрации:', oshibka);
    
    // если сервер вообще не отвечает, пишу понятное сообщение
    if (oshibka.message.includes('Failed to fetch') || oshibka.message.includes('NetworkError')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend сервер запущен на http://localhost:3001');
    }
    
    throw oshibka;
  }
}

// вхожу в систему по email и паролю
export async function voiti(email, parol) {
  const otvet = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: parol }),
  });
  
  if (!otvet.ok) {
    const oshibka = await otvet.json();
    throw new Error(oshibka.error || 'Ошибка при авторизации');
  }
  
  return await otvet.json();
}


const express = require('express');
const router = express.Router();
const pool = require('../db');

// регистрирую нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // проверяю что email и пароль заполнены
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    // проверяю формат email
    const regulyarnoeVirazhenie = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regulyarnoeVirazhenie.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }
    
    // проверяю длину пароля
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }
    
    // проверяю есть ли уже пользователь с таким email
    const sushestvuyushiyPolzovatel = await pool.query(
      'SELECT id_user FROM users WHERE email = $1',
      [email]
    );
    
    if (sushestvuyushiyPolzovatel.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // получаю роль пользователя, если нет то создаю
    let idRoliPolzovatelya;
    const rolPolzovatelya = await pool.query(
      "SELECT id_role FROM roles WHERE title ILIKE '%пользователь%' OR title ILIKE '%user%' LIMIT 1"
    );
    
    if (rolPolzovatelya.rows.length > 0) {
      idRoliPolzovatelya = rolPolzovatelya.rows[0].id_role;
    } else {
      // если роли пользователя нет, беру первую доступную роль (не админ)
      const roli = await pool.query(
        "SELECT id_role FROM roles WHERE title NOT ILIKE '%admin%' AND title NOT ILIKE '%админ%' ORDER BY id_role LIMIT 1"
      );
      if (roli.rows.length > 0) {
        idRoliPolzovatelya = roli.rows[0].id_role;
      } else {
        // если вообще нет ролей, создаю роль "Пользователь"
        const novayaRol = await pool.query(
          'INSERT INTO roles (title) VALUES ($1) RETURNING id_role',
          ['Пользователь']
        );
        idRoliPolzovatelya = novayaRol.rows[0].id_role;
      }
    }
    
    // создаю нового пользователя
    // в реальном проекте пароль должен быть захеширован через bcrypt
    const novyyPolzovatel = await pool.query(
      `INSERT INTO users (email, user_password, first_name, last_name, phone, role_id, personal_discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [email, password, firstName || null, lastName || null, phone || null, idRoliPolzovatelya, 0]
    );
    
    // получаю данные пользователя с ролью
    const rezultatPolzovatelya = await pool.query(
      `SELECT 
        u.id_user,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.role_id,
        u.personal_discount,
        r.title as role_title
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id_role
      WHERE u.id_user = $1`,
      [novyyPolzovatel.rows[0].id_user]
    );
    
    const polzovatel = rezultatPolzovatelya.rows[0];
    
    res.status(201).json({
      user: {
        id: polzovatel.id_user,
        email: polzovatel.email,
        firstName: polzovatel.first_name,
        lastName: polzovatel.last_name,
        phone: polzovatel.phone,
        roleId: polzovatel.role_id,
        roleTitle: polzovatel.role_title,
        personalDiscount: polzovatel.personal_discount
      },
      message: 'Регистрация успешна'
    });
  } catch (oshibka) {
    console.error('не получилось зарегистрировать пользователя:', oshibka);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// вхожу в систему по email и паролю
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    const rezultat = await pool.query(
      `SELECT 
        u.id_user,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.role_id,
        u.personal_discount,
        r.title as role_title
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id_role
      WHERE u.email = $1 AND u.user_password = $2`,
      [email, password]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const polzovatel = rezultat.rows[0];
    
    // не отправляю пароль в ответе
    delete polzovatel.user_password;
    
    res.json({
      user: {
        id: polzovatel.id_user,
        email: polzovatel.email,
        firstName: polzovatel.first_name,
        lastName: polzovatel.last_name,
        phone: polzovatel.phone,
        roleId: polzovatel.role_id,
        roleTitle: polzovatel.role_title,
        personalDiscount: polzovatel.personal_discount
      }
    });
  } catch (oshibka) {
    console.error('не получилось войти:', oshibka);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
});

module.exports = router;


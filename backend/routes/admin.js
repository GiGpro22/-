const express = require('express');
const router = express.Router();
const pool = require('../db');

// проверяю права админа, в реальном проекте тут была бы проверка JWT токена
const proveritPravaAdmina = async (req, res, next) => {
  // для упрощения проверяю через query параметр или header
  const idPolzovatelya = req.query.userId || req.headers['user-id'];
  
  if (!idPolzovatelya) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  try {
    const polzovatel = await pool.query(
      `SELECT u.*, r.title as role_title 
       FROM users u 
       INNER JOIN roles r ON u.role_id = r.id_role 
       WHERE u.id_user = $1`,
      [idPolzovatelya]
    );
    
    if (polzovatel.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const nazvanieRoli = polzovatel.rows[0].role_title.toLowerCase();
    if (!nazvanieRoli.includes('admin') && !nazvanieRoli.includes('админ')) {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    }
    
    req.user = polzovatel.rows[0];
    next();
  } catch (oshibka) {
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

// создаю категорию
router.post('/categories', proveritPravaAdmina, async (req, res) => {
  try {
    const { title, slug, is_active = true, display_order = 0 } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Название и slug обязательны' });
    }
    
    const rezultat = await pool.query(
      'INSERT INTO categories (title, slug, is_active, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, slug, is_active, display_order]
    );
    
    res.status(201).json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось создать категорию:', oshibka);
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

// обновляю категорию
router.put('/categories/:id', proveritPravaAdmina, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, is_active, display_order } = req.body;
    
    const rezultat = await pool.query(
      `UPDATE categories 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           is_active = COALESCE($3, is_active),
           display_order = COALESCE($4, display_order)
       WHERE id_category = $5 RETURNING *`,
      [title, slug, is_active, display_order, id]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось обновить категорию:', oshibka);
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
});

// удаляю категорию
router.delete('/categories/:id', proveritPravaAdmina, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM categories WHERE id_category = $1', [id]);
    
    res.json({ success: true });
  } catch (oshibka) {
    console.error('не получилось удалить категорию:', oshibka);
    res.status(500).json({ error: 'Ошибка при удалении категории' });
  }
});

// создаю товар
router.post('/services', proveritPravaAdmina, async (req, res) => {
  try {
    const { category_id, title, description, duration, price, discount = 0, product_image, is_active = true } = req.body;
    
    if (!category_id || !title || !duration || !price) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    
    const rezultat = await pool.query(
      `INSERT INTO products (category_id, title, description, duration, price, discount, product_image, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [category_id, title, description, duration, price, discount, product_image, is_active]
    );
    
    res.status(201).json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось создать товар:', oshibka);
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

// обновляю товар
router.put('/services/:id', proveritPravaAdmina, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, title, description, duration, price, discount, product_image, is_active } = req.body;
    
    const rezultat = await pool.query(
      `UPDATE products 
       SET category_id = COALESCE($1, category_id),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           duration = COALESCE($4, duration),
           price = COALESCE($5, price),
           discount = COALESCE($6, discount),
           product_image = COALESCE($7, product_image),
           is_active = COALESCE($8, is_active)
       WHERE id_product = $9 RETURNING *`,
      [category_id, title, description, duration, price, discount, product_image, is_active, id]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось обновить товар:', oshibka);
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

// удаляю товар
router.delete('/services/:id', proveritPravaAdmina, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM products WHERE id_product = $1', [id]);
    
    res.json({ success: true });
  } catch (oshibka) {
    console.error('не получилось удалить товар:', oshibka);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

// устанавливаю персональную скидку для пользователя
router.post('/users/:userId/discount', proveritPravaAdmina, async (req, res) => {
  try {
    const { userId } = req.params;
    const { personal_discount } = req.body;
    
    if (personal_discount < 0 || personal_discount > 100) {
      return res.status(400).json({ error: 'Скидка должна быть от 0 до 100%' });
    }
    
    const rezultat = await pool.query(
      'UPDATE users SET personal_discount = $1 WHERE id_user = $2 RETURNING *',
      [personal_discount, userId]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось установить скидку:', oshibka);
    res.status(500).json({ error: 'Ошибка при установке скидки' });
  }
});

// устанавливаю скидку на конкретный товар
router.post('/services/:serviceId/discount', proveritPravaAdmina, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { discount } = req.body;
    
    if (discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'Скидка должна быть от 0 до 100%' });
    }
    
    const rezultat = await pool.query(
      'UPDATE products SET discount = $1 WHERE id_product = $2 RETURNING *',
      [discount, serviceId]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось установить скидку:', oshibka);
    res.status(500).json({ error: 'Ошибка при установке скидки' });
  }
});

// выдаю купон пользователю с определенной скидкой
router.post('/users/:userId/coupons', proveritPravaAdmina, async (req, res) => {
  try {
    const { userId } = req.params;
    const { coupon_code, discount } = req.body;
    const idAdmina = req.user.id_user;
    
    if (!coupon_code || !discount) {
      return res.status(400).json({ error: 'Код купона и скидка обязательны' });
    }
    
    if (discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'Скидка должна быть от 0 до 100%' });
    }
    
    const rezultat = await pool.query(
      `INSERT INTO user_coupons (user_id, coupon_code, discount, assigned_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, coupon_code, discount, idAdmina]
    );
    
    res.status(201).json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось выдать купон:', oshibka);
    res.status(500).json({ error: 'Ошибка при выдаче купона' });
  }
});

// получаю список всех пользователей для админки
router.get('/users', proveritPravaAdmina, async (req, res) => {
  try {
    const rezultat = await pool.query(
      `SELECT u.*, r.title as role_title 
       FROM users u 
       INNER JOIN roles r ON u.role_id = r.id_role 
       ORDER BY u.created_at DESC`
    );
    
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить пользователей:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

// получаю все заказы для просмотра в админке
router.get('/appointments', proveritPravaAdmina, async (req, res) => {
  try {
    const rezultat = await pool.query(
      `SELECT 
        a.*, 
        u.email, u.first_name, u.last_name,
        COUNT(ai.id_order_item) as items_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ai.id_order_item,
              'product_id', ai.product_id,
              'product_title', p.title,
              'quantity', ai.quantity,
              'price', ai.price
            )
          ) FILTER (WHERE ai.id_order_item IS NOT NULL),
          '[]'::json
        ) as items
       FROM orders a
       INNER JOIN users u ON a.user_id = u.id_user
       LEFT JOIN orders_items ai ON a.id_order = ai.order_id
       LEFT JOIN products p ON ai.product_id = p.id_product
       GROUP BY a.id_order, u.email, u.first_name, u.last_name
       ORDER BY a.created_at DESC`
    );
    
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить заказы:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;


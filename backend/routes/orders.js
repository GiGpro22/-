const express = require('express');
const router = express.Router();
const pool = require('../db');

// создаю заказ из товаров в корзине
router.post('/', async (req, res) => {
  try {
    console.log('пришел запрос на создание заказа:', req.body);
    const { userId, cartId, deliveryAddress, paymentMethod, couponCode } = req.body;
    
    if (!cartId) {
      return res.status(400).json({ error: 'ID корзины обязателен' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    // получаю товары из корзины
    const tovaryKorzini = await pool.query(
      `SELECT 
        ci.*,
        s.title,
        s.price as original_price,
        s.discount
      FROM cart_items ci
      INNER JOIN products s ON ci.product_id = s.id_product
      WHERE ci.cart_id = $1`,
      [cartId]
    );
    
    if (tovaryKorzini.rows.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }
    
    // получаю информацию о пользователе для расчета скидок
    const polzovatel = await pool.query(
      'SELECT personal_discount FROM users WHERE id_user = $1',
      [userId]
    );
    
    const personalnayaSkidka = polzovatel.rows[0]?.personal_discount || 0;
    
    // получаю активный купон пользователя, если указан
    let skidkaKupona = 0;
    if (couponCode) {
      const kupon = await pool.query(
        'SELECT discount FROM user_coupons WHERE user_id = $1 AND coupon_code = $2 AND is_active = TRUE AND used_at IS NULL',
        [userId, couponCode]
      );
      
      if (kupon.rows.length > 0) {
        skidkaKupona = kupon.rows[0].discount;
      }
    }
    
    // считаю итоговую сумму
    let obshayaSumma = 0;
    let obshayaSkidka = 0;
    
    tovaryKorzini.rows.forEach(tovar => {
      const cenaTovara = parseFloat(tovar.original_price);
      const skidkaNaTovar = tovar.discount || 0;
      const summaTovara = cenaTovara * tovar.quantity;
      const summaSkidkiNaTovar = (summaTovara * skidkaNaTovar) / 100;
      obshayaSumma += summaTovara;
      obshayaSkidka += summaSkidkiNaTovar;
    });
    
    // применяю персональную скидку или скидку купона (беру максимальную)
    const maksimalnayaPersonalnayaSkidka = Math.max(personalnayaSkidka, skidkaKupona);
    const summaPersonalnoySkidki = (obshayaSumma * maksimalnayaPersonalnayaSkidka) / 100;
    
    const itogovayaSumma = obshayaSumma - obshayaSkidka - summaPersonalnoySkidki;
    const itogovayaSkidka = obshayaSkidka + summaPersonalnoySkidki;
    
    // генерирую номер заказа
    const nomerZakaza = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // создаю заказ
    const zakaz = await pool.query(
      `INSERT INTO orders (
        user_id, 
        order_number, 
        total_cost, 
        discount, 
        coupon_code,
        order_status,
        delivery_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
        nomerZakaza,
        itogovayaSumma,
        Math.round((itogovayaSkidka / obshayaSumma) * 100),
        couponCode || null,
        'pending',
        deliveryAddress || null
      ]
    );
    
    const idZakaza = zakaz.rows[0].id_order;
    
    // создаю элементы заказа
    for (const tovar of tovaryKorzini.rows) {
      await pool.query(
        'INSERT INTO orders_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [idZakaza, tovar.product_id, tovar.quantity, tovar.price]
      );
    }
    
    // создаю запись о платеже
    await pool.query(
      `INSERT INTO payments (
        order_id,
        user_id,
        amount,
        payment_method,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        idZakaza,
        userId,
        itogovayaSumma,
        paymentMethod || 'cash',
        'pending'
      ]
    );
    
    // помечаю купон как использованный, если он был применен
    if (couponCode && skidkaKupona > 0) {
      await pool.query(
        'UPDATE user_coupons SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND coupon_code = $2 AND used_at IS NULL',
        [userId, couponCode]
      );
    }
    
    // очищаю корзину
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await pool.query('DELETE FROM cart WHERE id_cart = $1', [cartId]);
    
    res.status(201).json({
      success: true,
      order: {
        id: idZakaza,
        orderNumber: nomerZakaza,
        totalCost: itogovayaSumma,
        status: 'pending'
      },
      message: 'Заказ успешно оформлен'
    });
  } catch (oshibka) {
    console.error('не получилось создать заказ:', oshibka);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// получаю все заказы конкретного пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rezultat = await pool.query(
      `SELECT 
        a.*,
        COUNT(ai.id_order_item) as items_count
      FROM orders a
      LEFT JOIN orders_items ai ON a.id_order = ai.order_id
      WHERE a.user_id = $1
      GROUP BY a.id_order
      ORDER BY a.created_at DESC`,
      [userId]
    );
    
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить заказы:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;


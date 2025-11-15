const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const categoriesRoutes = require('./routes/categories');
const servicesRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const discountsRoutes = require('./routes/discounts');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');

app.use('/api/categories', categoriesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/discounts', discountsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);

// Логирование зарегистрированных маршрутов
console.log('Зарегистрированные маршруты:');
console.log('  /api/categories');
console.log('  /api/services');
console.log('  /api/auth');
console.log('  /api/cart');
console.log('  /api/discounts');
console.log('  /api/admin');
console.log('  /api/orders');

// Проверка подключения к БД
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
});


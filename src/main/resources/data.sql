INSERT INTO categories (name, description) VALUES
('Электроника', 'Смартфоны, ноутбуки, планшеты и аксессуары') ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('Одежда', 'Мужская и женская одежда, обувь') ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('Книги', 'Учебники, художественная литература, техническая литература') ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('Спорт', 'Спортивный инвентарь, тренажёры, одежда для спорта') ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('Дом и сад', 'Мебель, инструменты, декор для дома') ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'iPhone 15', 'Смартфон Apple 2023', 999.99, 50, 'https://example.com/iphone15.jpg',
    id, NOW() FROM categories WHERE name = 'Электроника'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'iPhone 15')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Samsung Galaxy S24', 'Флагманский смартфон Samsung', 799.99, 30, 'https://example.com/galaxy-s24.jpg',
    id, NOW() FROM categories WHERE name = 'Электроника'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Samsung Galaxy S24')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'MacBook Pro M3', 'Ноутбук Apple с процессором M3', 1999.99, 15, 'https://example.com/macbook-pro-m3.jpg',
    id, NOW() FROM categories WHERE name = 'Электроника'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'MacBook Pro M3')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Кроссовки Nike Air Max', 'Удобные кроссовки для повседневной носки', 129.99, 100, 'https://example.com/nike-air-max.jpg',
    id, NOW() FROM categories WHERE name = 'Одежда'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Кроссовки Nike Air Max')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Джинсы Levi''s 501', 'Классические джинсы прямого кроя', 79.99, 200, 'https://example.com/levis-501.jpg',
    id, NOW() FROM categories WHERE name = 'Одежда'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Джинсы Levi''s 501')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Clean Code by Robert Martin', 'Книга о чистом и поддерживаемом коде', 29.99, 500, 'https://example.com/clean-code.jpg',
    id, NOW() FROM categories WHERE name = 'Книги'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Clean Code by Robert Martin')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Spring in Action', 'Практическое руководство по Spring Framework', 39.99, 300, 'https://example.com/spring-in-action.jpg',
    id, NOW() FROM categories WHERE name = 'Книги'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Spring in Action')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Гантели 10 кг пара', 'Пара гантелей для домашних тренировок', 49.99, 80, 'https://example.com/dumbbells-10kg.jpg',
    id, NOW() FROM categories WHERE name = 'Спорт'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Гантели 10 кг пара')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Коврик для йоги', 'Нескользящий коврик для йоги и фитнеса', 24.99, 150, 'https://example.com/yoga-mat.jpg',
    id, NOW() FROM categories WHERE name = 'Спорт'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Коврик для йоги')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, created_at)
SELECT 'Кофемашина DeLonghi', 'Автоматическая кофемашина для дома', 399.99, 25, 'https://example.com/delonghi-coffee.jpg',
    id, NOW() FROM categories WHERE name = 'Дом и сад'
    AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Кофемашина DeLonghi')
ON CONFLICT DO NOTHING;

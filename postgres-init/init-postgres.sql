CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'user',
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
  'Administrador',
  'admin@ejemplo.com',
  '$2b$10$3jwrDB1iR9uJ/o5ldHv1KObmqvJZW9lDybZIywi9UBCxBExgJOAxi',  -- hash de '123'
  'admin'
)
ON CONFLICT (email) DO NOTHING;

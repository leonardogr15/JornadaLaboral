

Jornada Laboral es una aplicación web para el control de la jornada laboral. Permite a los usuarios iniciar sesión, registrar horas de entrada y salida y consultar un historial de jornadas.

1. Clona el repositorio:

   git clone https://github.com/leonardogr15/JornadaLaboral.git
   cd JornadaLaboral

2. Levanta todos los servicios (frontend, backend, PostgreSQL y MongoDB) con un solo comando:

   docker-compose up --build -d

3. Accede a la aplicación:

   -Frontend: [http://localhost:3000](http://localhost:3000)
   -Backend/API: [http://localhost:5000/api](http://localhost:5000/api)

4. Login: copy `.env.example` to `.env` before step 2. The demo admin is created on first start with `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` from your `.env`; no default password is published.

5. Para detener y eliminar todos los contenedores:
   docker-compose down




Jornada Laboral es una aplicación web para el control de la jornada laboral. Permite a los usuarios iniciar sesión, registrar horas de entrada y salida y consultar un historial de jornadas.

1. Clona el repositorio:

   git clone https://github.com/leonardogr15/JornadaLaboral.git
   cd JornadaLaboral

2. Levanta todos los servicios (frontend, backend, PostgreSQL y MongoDB) con un solo comando:

   docker-compose up --build -d

3. Accede a la aplicación:

   -Frontend: [http://localhost:3000](http://localhost:3000)
   -Backend/API: [http://localhost:5000/api](http://localhost:5000/api)

4. Credenciales iniciales para el login:
   Usuario: admin@ejemplo.com
   Contraseña: 123

5. Para detener y eliminar todos los contenedores:
   docker-compose down


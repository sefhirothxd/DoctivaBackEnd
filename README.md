# Skillien Backend

API REST para gestionar cursos, estudiantes, inscripciones, recursos educativos y usuarios. Está desarrollada con Node.js, TypeScript, Express y Sequelize, y utiliza PostgreSQL como base de datos.

## Requisitos

- Node.js y npm
- Una base de datos PostgreSQL accesible desde la aplicación

## Instalación y ejecución

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` en la raíz del proyecto:

   ```env
   PORT=3001
   DATABASE_URL=postgres://usuario:contraseña@host:5432/nombre_base
   JWT_SECRET=una_clave_secreta
   ```

   `PORT` es opcional (por defecto, `3001`). `DATABASE_URL` debe contener la URL de conexión a PostgreSQL. `JWT_SECRET` se utiliza para firmar los tokens de inicio de sesión; si no se define, el código usa una clave predeterminada, por lo que se recomienda configurarla.

3. Inicia el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El servidor inicia en `http://localhost:3001` (o en el puerto configurado en `PORT`) y monta la API bajo `/api`.

### Otros comandos

| Comando | Descripción |
| --- | --- |
| `npm run build` | Compila TypeScript en `dist/`. |
| `npm start` | Ejecuta la aplicación compilada desde `dist/index.js`. |

Para ejecutar la versión compilada, primero ejecuta `npm run build` y luego `npm start`.

## Rutas de la API

Todas las rutas están prefijadas con `/api`. Las respuestas y los cuerpos de solicitud usan JSON; en solicitudes con cuerpo, envía `Content-Type: application/json`.

### Cursos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/cursos` | Lista los cursos e incluye sus recursos asociados. |
| `GET` | `/api/cursos/:id` | Obtiene un curso por su UUID e incluye sus recursos. Devuelve `404` si no existe. |
| `POST` | `/api/cursos` | Crea un curso. |

Ejemplo de cuerpo para `POST /api/cursos`:

```json
{
  "codigo": "CUR-101",
  "nombre": "Introducción a la programación",
  "docente_nombre": "Ana Pérez",
  "modalidad": "Virtual",
  "horario": "Lunes 10:00",
  "aula": "En línea",
  "descripcion": "Curso de fundamentos"
}
```

`codigo`, `nombre`, `docente_nombre`, `modalidad` y `horario` son obligatorios.

### Estudiantes

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/estudiantes` | Lista estudiantes con sus datos de usuario (sin el hash de contraseña) e inscripciones con cursos. |
| `GET` | `/api/estudiantes/:id` | Obtiene un estudiante por su UUID con sus datos relacionados. Devuelve `404` si no existe. |
| `POST` | `/api/estudiantes` | Crea un registro de estudiante directamente. |

Ejemplo de cuerpo para `POST /api/estudiantes`:

```json
{
  "usuario_id": "UUID-DE-USUARIO",
  "nombres": "Luis",
  "apellidos": "García",
  "telefono": "555-0100"
}
```

`usuario_id`, `nombres` y `apellidos` son obligatorios. Para crear una cuenta de usuario y su perfil de estudiante en un solo paso, usa `POST /api/usuarios/registro-estudiante`.

### Inscripciones

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/inscripciones` | Lista inscripciones e incluye el estudiante y el curso asociados. |
| `POST` | `/api/inscripciones` | Procesa la matrícula de un estudiante en uno o más cursos. |

Cuerpo para `POST /api/inscripciones`:

```json
{
  "estudiante_id": "UUID-DE-ESTUDIANTE",
  "curso_ids": ["UUID-DE-CURSO-1", "UUID-DE-CURSO-2"]
}
```

Ambos campos son obligatorios y `curso_ids` debe ser un arreglo. Las inscripciones existentes no se duplican; las nuevas se crean con estado `activo`.

### Recursos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/recursos` | Lista recursos e incluye los cursos asociados. |
| `POST` | `/api/recursos` | Crea un recurso. |

Ejemplo de cuerpo para `POST /api/recursos`:

```json
{
  "codigo": "REC-101",
  "titulo": "Guía de estudio",
  "descripcion": "Material introductorio",
  "asignatura": "Programación",
  "url": "https://ejemplo.com/guia",
  "autor": "Equipo docente"
}
```

`codigo`, `titulo`, `asignatura` y `url` son obligatorios.

### Usuarios y autenticación

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/usuarios/registro-estudiante` | Registra una cuenta y crea su perfil de estudiante en una transacción. |
| `POST` | `/api/usuarios/login` | Valida las credenciales y devuelve un token JWT válido durante 8 horas. |

Cuerpo para el registro:

```json
{
  "email": "luis@example.com",
  "password": "contraseña",
  "nombres": "Luis",
  "apellidos": "García",
  "telefono": "555-0100"
}
```

`email`, `password`, `nombres` y `apellidos` son obligatorios. La contraseña se almacena como hash; el rol del usuario creado es `estudiante`.

Cuerpo para el inicio de sesión:

```json
{
  "email": "luis@example.com",
  "password": "contraseña"
}
```

La respuesta exitosa incluye `token` y `usuario`. El hash de contraseña no se devuelve. Los endpoints actuales no requieren enviar el token para acceder.

## Datos y relaciones

- Los identificadores de cursos, estudiantes, inscripciones, recursos y usuarios son UUID.
- Un estudiante pertenece a un usuario y puede tener varias inscripciones.
- Cada inscripción relaciona un estudiante con un curso.
- Cursos y recursos se relacionan entre sí mediante la tabla `recursos_curso`.
- Al iniciar la aplicación se autentica la conexión y Sequelize sincroniza los modelos con la base de datos.

## Respuestas de error

Los errores se devuelven en JSON, normalmente con un campo `mensaje`. Los endpoints de consulta pueden responder `500` si ocurre un error de servidor; los endpoints de creación pueden responder `400` ante datos no aceptados. El registro también puede responder `409` si el correo ya existe; el inicio de sesión devuelve `401` para credenciales inválidas y `403` si la cuenta no está activa.
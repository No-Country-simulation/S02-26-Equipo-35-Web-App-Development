# Backend Setup Guide ⬅️ [Back](../README.md)

Bienvenido a **VerticalAI**. Esta guía te explica cómo levantar el backend en tu máquina para poder conectarlo con el frontend sin perder tiempo.

### Stack principal

- **Django** — API principal
- **Celery** — tareas en segundo plano (procesamiento de videos)
- **Redis** — servicio que usa Celery para funcionar
- **Cloudinary** — almacenamiento de videos
- **Swagger** — documentación y pruebas de la API

---

## ✅ Requisitos Previos

Instalá esto antes de empezar:

- Python **3.12+**
- Git
- **Redis** ⚠️ (necesario para procesar videos)

---

## ⚙️ Configuración del Proyecto

### 1️⃣ Clonar el repositorio

```bash
git clone <repo-url>
cd <project-folder>
```

---

### 2️⃣ Crear y activar entorno de Python (venv)

Esto crea un entorno aislado para el proyecto. Solo tenés que hacerlo una vez.

```bash
python -m venv venv
```

#### Activarlo:

**Linux / Mac**

```bash
source venv/bin/activate
```

**Windows**

```bash
venv\Scripts\activate
```

Cuando esté activo vas a ver `(venv)` al inicio de la terminal.

---

### 3️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

Esto instala Django, Celery y el resto de las librerías.

---

### 🔐 Variables de Entorno (.env)

Creá un archivo llamado **`.env`** en la raíz del proyecto Django.

```
# Django Security
SECRET_KEY="django-insecure-example-key-change-this"
DEBUG=True

# Cloudinary Settings (ejemplo)
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret

CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

⚠️ Nunca subir este archivo a Git.

---

### 🧱 Base de Datos (OBLIGATORIO)

⚠️ \*\*Este paso es obligatorio antes de ejecutar cualquier cosa.

Ejecutá:

```bash
python manage.py migrate
```

Esto crea todas las tablas necesarias en la base de datos.

Opcional (solo si necesitás acceso admin):

```bash
python manage.py createsuperuser
```

---

### ⚡ Redis + Celery (MUY IMPORTANTE)

VerticalAI procesa videos en segundo plano.

👉 Para que eso funcione, **Redis debe estar corriendo** y **Celery debe estar activo**.

---

### 1️⃣ Instalar Redis

#### Linux (Ubuntu)

```bash
sudo apt install redis-server
```

#### Mac

```bash
brew install redis
```

#### Windows (recomendado usar Docker)

```bash
docker run -d -p 6379:6379 redis
```

---

### 2️⃣ Iniciar Redis

```bash
redis-server
```

Chequeo rápido:

```bash
redis-cli ping
```

Debe responder:

```
PONG
```

---

### 3️⃣ Ejecutar Celery

Abrí **otra terminal** (dejá Redis corriendo) y ejecutá:

```bash
celery -A core worker -l info
```

👉 `core` es el nombre del proyecto.

⚠️ **Si Redis o Celery no están corriendo, el procesamiento de videos NO funcionará.**

---

### ▶️ Levantar el Servidor Django

En otra terminal:

```bash
python manage.py runserver
```

El backend estará disponible en:

👉 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 🐳 Levantar Backend con Docker (la forma simple)

Todo listo con un solo comando. No hace falta instalar nada más que `docker`.

### Desde la raiz del proyecto

1️⃣ Primera vez (construir y levantar)

```bash
docker compose up --build
```

2️⃣ Levantar después

```
docker compose up
```

3️⃣ Apagar

```
docker compose down
```

> 💡 Listo. El backend estará corriendo y listo para usar.

---

---

## 📘 Swagger — Probar la API

Entrá en:

👉 [http://127.0.0.1:8000/swagger/#/](http://127.0.0.1:8000/swagger/#/)

Desde Swagger podés:

- Ver endpoints
- Probar requests
- Validar respuestas
- Autenticarte

---

## 🔑 Autenticación con Token en Swagger

### 1️⃣ Obtener token

Buscá el endpoint de login/token.

![Login](../assets/images/login.jpg)

Tocá Try it out

Ingresá tus credenciales:

```
{
  "username": "tu_usuario",
  "password": "tu_password"
}
```

Luego presioná Execute.

Swagger va a responder con un token.

Ejemplo:

```
{
  "token": "123abc456xyz..."
}
```

👉 Copiá ese token.

---

### 2️⃣ Autorizar

Arriba a la derecha vas a ver el botón Authorize.
![Login](../assets/images/authorize.jpg)

Hacé click y se abrirá una ventana.

![Login](../assets/images/ventana.jpg)

En el campo Value pegá EXACTAMENTE esto:

Token tu_token

Luego presioná Authorize y cerrá la ventana.

3. Confirmá.

Listo ✅ — ya podés usar endpoints protegidos.

---

## ✅ Orden recomendado para levantar TODO (IMPORTANTE)

Seguí este orden EXACTO para evitar errores:

- 1️⃣ Activar el entorno (`venv`)
- 2️⃣ Instalar dependencias → `pip install -r requirements.txt`
- 3️⃣ Ejecutar migraciones → `python manage.py migrate`
- 4️⃣ Iniciar Redis
- 5️⃣ Ejecutar Celery
- 6️⃣ Levantar Django

👉 **Si Celery falla, casi siempre es porque no corriste `migrate`.**

---

## 🎯 Objetivo

Si todo está corriendo correctamente, el frontend podrá:

- Enviar videos
- Consultar el estado del procesamiento
- Obtener las URLs finales

---

Si algo no arranca, avisá al equipo backend 👍

⬅️ [Back](../README.md)

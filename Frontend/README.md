# Go Vertical Frontend ⬅️ [Back](../README.md)

Este repositorio contiene el **frontend** de Go Vertical, la plataforma para generar automáticamente shorts verticales a partir de videos horizontales.

Está desarrollado en **React** con Vite, y se conecta con el backend para enviar videos, consultar el estado del procesamiento y recibir los shorts listos para publicar.

---

## ⚙️ Tecnologías Principales

### 🎨 Frontend

- **React** – Biblioteca principal para construir interfaces.
- **React Router DOM** – Manejo de rutas y navegación.
- **React Toastify** – Notificaciones y mensajes al usuario.
- **Bootstrap 5** – Framework de estilos y componentes.
- **CSS personalizado** – Ajustes visuales y branding.

---

## ✅ Requisitos Previos

- Node.js **18+**
- npm o yarn
- Backend corriendo (ver [Backend README](../Backend/README.md)) o vía Docker (ver README principal)

---

## 🛠️ Instalación y Configuración

1️⃣ **Clonar el repositorio**

```bash
git clone <url-del-frontend>
cd Frontend
```

2️⃣ Instalar dependencias

```bash
npm install
```

3️⃣ Configurar variables de entorno (opcional)

Si hay variables necesarias, crear `.env.local` en la raíz del frontend. Por ejemplo:

```env
VITE_API_URL=http://localhost:8000/api
```

> Esto apunta al backend local. Cambiar según corresponda.

4️⃣ Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## 🎯 Objetivo

El frontend permite a los usuarios:

- Subir videos horizontales

- Consultar el estado de procesamiento en tiempo real

- Descargar o compartir los shorts generados en formato vertical (9:16)

---

---

> _Proyecto desarrollado por el equipo de Go Vertical.
> Para levantar todo el sistema completo, consultar el [README principal](../README.md)._

---

# 🎬 Video Shorts Generator

## Problemática

Al convertir videos en formato horizontal a formato vertical, suele perderse información importante de la imagen, afectando la calidad visual y el mensaje del contenido.

Además, la generación manual de shorts a partir de videos largos requiere tiempo y recursos, lo que representa una tarea operativa que no forma parte del core del negocio para startups, pymes y emprendedores.

## Descripción

En el contexto actual, las redes sociales priorizan el contenido en formato vertical (shorts, reels, tiktoks). Para aumentar visibilidad, autoridad y generar oportunidades comerciales o de talento, es necesario mantener una presencia constante mediante la publicación de contenido adaptado a estos formatos.

Sin embargo, producir versiones verticales y múltiples shorts desde un mismo video horizontal implica:

- Recorte manual del contenido
- Edición y reencuadre
- Publicación repetitiva
- Consumo elevado de tiempo

Esto desvía recursos de actividades estratégicas del negocio.

## 💡 Solución

Nuestra plataforma permite generar automáticamente shorts verticales a partir de videos horizontales largos.

El sistema:

- Recibe un video horizontal como entrada
- Permite definir fragmentos de hasta 60 segundos
- Recorta el contenido seleccionado
- Adapta el video al formato vertical (9:16)
- Ofrece dos tipos de formato vertical:
  - Vertical recortado (ajustando el encuadre al centro)
  - Vertical con video horizontal centrado, agregando márgenes superiores e inferiores (letterbox)
- Genera shorts listos para publicar en redes sociales

De esta manera, se agiliza el proceso de creación de contenido para plataformas como Instagram Reels, TikTok y YouTube Shorts, reduciendo el tiempo de edición y permitiendo al usuario elegir el formato que mejor se adapte a su estrategia de publicación.

---

## 👥 Equipo

| ![Product Manager](docs/avatars/mauro_rosales.png) | ![Visual Designer](docs/avatars/nikolas.png) | ![3D Modeler](docs/avatars/valentina.png) | ![Story Designer](docs/avatars/jeanine_aedo.png) |
| :------------------------------------------------: | :------------------------------------------: | :---------------------------------------: | :----------------------------------------------: |
|                 **Mauro Rosales**                  |                 **Nikolas**                  |               **Valentina**               |                 **Jeanine Aedo**                 |
|                  Product Manager                   |               Visual Designer                |                3D Modeler                 |                  Story Designer                  |

| ![Audio Designer](docs/avatars/dani_vega.png) | ![Programmer](docs/avatars/mike.png) | ![Programmer](docs/avatars/anthony.png) |
| :-------------------------------------------: | :----------------------------------: | :-------------------------------------: |
|                 **Dani Vega**                 |               **Mike**               |            **Anthony Bañon**            |
|                Audio Designer                 |              Programmer              |               Programmer                |

## 🖼️ Capturas del Proyecto

> Espacio destinado para mostrar el funcionamiento de la aplicación.

- Vista Home
- Proceso de carga de video
- Resultado en formato vertical

```md
![Home](assets/screens/home.png)
![Upload](assets/screens/upload.png)
![Result](assets/screens/result.png)
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

- JavaScript
- React
- Bootstrap
- HTML5
- CSS3

### Backend

- Python
- Django
- Django REST Framework

### Otros

- FFmpeg
- Git & GitHub
- Metodologías Ágiles (Scrum)

---

## 📦 Documentación

- 🎨 Frontend → [Frontend README](Frontend/README.md)
- ⚙️ Backend → [Backend README](Backend/README.md)

### 📚 Documentación API

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de las APIs:

**🎯 Interfaces de documentación:**

- **🔗 Swagger UI**: `http://127.0.0.1:8000/swagger/` (Interfaz interactiva para probar endpoints)
- **🔗 ReDoc**: `http://127.0.0.1:8000/redoc/` (Documentación detallada)

#### Endpoints disponibles:

**🎥 Shorts (Videos Cortos):**

- `GET /api/shorts/` - Lista todos los shorts (con filtros por status y video)
- `GET /api/shorts/{id}/` - Obtiene un short específico
- **Filtros**: `?status=ready&video=123`

**🎬 Videos (Próximamente):**

- `GET /api/videos/` - Lista videos originales
- `POST /api/videos/` - Subir nuevo video
- `GET /api/videos/{id}/` - Obtener video específico

**👥 Users (Próximamente):**

- `POST /api/users/register/` - Registro de usuario
- `POST /api/users/login/` - Inicio de sesión
- `GET /api/users/profile/` - Perfil de usuario

---

## 📈 Estado del Proyecto

🟡 En desarrollo

Próximas mejoras:

- Ajuste automático de encuadre
- Detección inteligente de foco
- Exportación directa a redes sociales

---

## 📄 Licencia

Este proyecto se desarrolla con fines educativos y de demostración profesional.

---

## 🤝 Contacto

Si deseas colaborar o conocer más sobre el proyecto, no dudes en contactarnos.

---

✨ _Proyecto desarrollado en equipo, enfocado en resolver un problema real del mercado digital._

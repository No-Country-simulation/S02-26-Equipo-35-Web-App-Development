FROM python:3.12-slim

# Evita archivos .pyc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalar dependencias del sistema + ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (mejor cache)
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Puerto Django
EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]

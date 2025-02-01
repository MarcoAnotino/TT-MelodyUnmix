# Melody Unmix

## Introducción
**Melody Unmix** es una aplicación web diseñada para la separación de pistas y descomposición musical utilizando inteligencia artificial y procesamiento digital de señales. Permite a los usuarios cargar archivos de audio y extraer individualmente instrumentos como voz, guitarra, bajo y batería. 

## Implementación y Funcionamiento
### Estructura General del Sistema
1. El usuario accede a la página web **Melody Unmix** desde su navegador.
2. La interfaz gráfica, construida con Bootstrap y JavaScript, permite la carga de archivos de audio en formatos como MP3, WAV o FLAC.
3. El archivo se sube al servidor, donde Django lo gestiona y lo envía a los modelos de IA para su procesamiento.
4. Mediante **TensorFlow** y **Spleeter**, la señal de audio es analizada y separada en pistas individuales según la selección del usuario.
5. Los archivos de audio procesados son almacenados en la base de datos y puestos a disposición del usuario para su consulta y descarga.

## Instalación y Ejecución
Para ejecutar la aplicación en un entorno local, siga los siguientes pasos:

### Requisitos Previos
- Tener instalado **Python 3.x** y **pip**.
- Tener instalado **Django** y las dependencias necesarias.
- Contar con **TensorFlow** y **Spleeter**.

### Pasos de Instalación
1. Clonar este repositorio:
   ```sh
   git clone https://github.com/MarcoAnotino/TT-MelodyUnmix.git
   cd melody-unmix
   ```
2. Crear un entorno virtual y activarlo:
   ```sh
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```
3. Instalar dependencias:
   ```sh
   pip install -r requirements.txt
   ```
4. Aplicar migraciones de base de datos:
   ```sh
   python manage.py migrate
   ```
5. Iniciar el servidor de desarrollo:
   ```sh
   python manage.py runserver
   ```
6. Acceder a la aplicación desde el navegador en:
   ```
   http://127.0.0.1:8000
   ```



## Licencia
Aqui va la parte de descripción para licencia. Pongo un ejemplo de internet para que vayamos viendo como seria este apartado.

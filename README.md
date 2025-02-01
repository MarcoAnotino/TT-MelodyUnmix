# TT-MelodyUnmix
Melody Unmix: Aplicación web para separación de pistas y descomposición musical

Tecnologías a utilizar:
    - Bootstrap: Es un framework CSS que se utiliza para la creación de aplicaciones front-end. Incluye estilos predefinidos de CSS y también componentes interactivos de Javascript.
    - CSS: Es un lenguaje de estilos utilizado en la programación web, nos permite dar color, tamaño, posicion, animación y estilo a los elementos HTML.
    - Javascript: Es un lenguaje de programación que nos permitirá añadir interacción en la aplicación web.
    - Django: Es un framework utilizado en python para el desarrollo web, este nos apoya para la construcción del back-end. Facilita la creación de API's para lograr la comunicación con el front-end.
    - Python: Es uno de los lenguajes de programación mas utilizados actualmente. Este se emplea principalmente para la creación
    de aplicaciones de análisis de datos y de inteligencia artificial (IA).
    - TensorFlow: Se trata de una biblioteca de código abierto perteneciente a GOOGLE, se utiliza para procesamiento matemático y para Machine Learning. Este nos ayudará para el procesamiento de las señales.
    - Spleeter: Es una herramienta desarrollada por Deezer, la cual ayuda a la descomposición de fuentes musicales, nos ayudará para la división de las pistas de audio y separar voz, guitarra, bajo y bateria.
    - SQL: Es un lenguaje de consulta de base de datos. Este nos ayudará para almacenar los datos de las pistas musicales que se carguen en la aplicación web.

Guía de instalación de las tecnologías:

    Bootstrap: 
    Colocar el siguiente código en el archivo HTML dentro del <head> :
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    Antes de cerrar el <body>, agregar el siguiente script de Javascript:
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>


    Django: 
    Ejecutar en una terminal el siguiente comando:
    pip install django

    Para verificar la versión, ejecutar el siguiente comando:
    django-admin --version

    Para crear un proyecto base, ejecutar el siguiente comando:
    django-admin startproject myproject
    cd myproject
    python manage.py runserver

    Python:
    Descargar pyhton desde el sitio oficial: 
    https://www.python.org/downloads/

    Durante el proceso de instalación es importante seleccionar la opción: "Add Python to PATH"

    En una terminal, verificar la instalación con el comando:
    python --version


    TensorFlow:
    En una terminal, ejecutar el comando:
    pip install tensorflow

    Verificar la instalación con el comando:
    python -c "import tensorflow as tf; print(tf.__version__)"

    Spleeter:
    En una terminal, ejecutar el comando:
    pip install spleeter

    Verificar la instalación con el comando:
    spleeter --help

    SQL:
    Descargaremos MySQLServer desde el sitio oficial:
    https://dev.mysql.com/downloads/mysql/

    Realizaremos la instalación y configuraremos un usuario root y una contraseña

    Verificaremos la instalacion mediante el comando:
    mysql --version

    Accederemos a la consola mediante el siguiente comando:
    mysql -u root -p

    Importante, instalar la conexión de python con MySQL, mediante el siguiente comando:
    pip install mysql-connector-python



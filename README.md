ALUMNO: Sebastián Javier Andreozzi
DEPLOY: https://sebastianjavier-andreozzi-tp-2-prog.vercel.app?_vercel_share=I0UVn9MqEuZDUxY6EH1GLiupb8DcRo57
TECNOLOGÍAS: BD con MongoDB
FrontEnd con Angular21
BackEnd con NestJS
Claudinary para almacenar imagenes
Deploy - FrontEnd con Vercel
Deploy - Backend con Render

Sprint 2
En este sprint le di funcionalidad a la pantalla de publicaciones, creando un nuevo componente post-card para mostrar cada publicación. También le agregue la funcionalidad de crear una nueva publicación con la opción de sumarle una imagan. Todas las imágenes ahora se guardan en claudinary. Las publicaciones vienen ordenadas por fecha de más reciente a menos reciente y pueden reordenarse por cantidad de likes, asi como eliminarse por el autor de la publicación. En la pantalla de perfil ahora se encuientra visible la información del usuario activo, pudiendo este editarla, y ver sus ultimas 3 publicaciones.
En el backend agregué los endpoints POST para crear publicaciones nuevas, PUT para editar la información de perfil, GET para traer las publicaciones, reordenarlas, y la información del usuario y DELETE para hacer la eliminación logica de las publicaciones.

Sprint 1
En este sprint creé el proyecto FrontEnd en Angular y BackEnd en NestJS. Cree los componentes de login, registro, publicaciones y perfil-usuario y agregue las funncionalidades de login y registro a los componentes correspondientes. También creé un componente header para que sea un elemento compartido entre todos los componentes. Para la funcionalidad de login y registro hice los servicios auth.service.ts(donde están las peticiones al BackEnd) y user.interceptor.ts que suma el id de quien está haciendo la petición. También hice los validadores necesarios para que la información sea correcta antes de enviarla al BackEnd.
En el BackEnd valido que la información recibida desde  el FrontEnd sea correcta, los email y nombres de usuario no se repitan y las fechas se guarden en el formato correcto. Tambien guardo las imagenes de perfil de los usuarios o asigno una por default si no cargan una propia.
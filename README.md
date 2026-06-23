ALUMNO: Sebastián Javier Andreozzi
DEPLOY: https://tp1sala-juegossebasti-git-fe13d0-sebastian-andreozzi-s-projects.vercel.app?_vercel_share=PYDa7Jq2FluH5zuOCTIMIGxkQUsKoree
TECNOLOGÍAS: BD con MongoDB
FrontEnd con Angular21
BackEnd con NestJS
Deploy - FrontEnd con Vercel
Deploy - Backend con Render

Sprint 1
En este sprint cree el proyecto FrontEnd en Angular y BackEnd en NestJS. Cree los componentes de login, registro, publicaciones y perfil-usuario y agregue las funncionalidades de login y registro a los componentes correspondientes. También cree un componente header para que sea un elemento compartido entre todos los componentes. Para la funcionalidad de login y registro hice los servicios auth.service.ts(donde están las peticiones al BackEnd) y user.interceptor.ts que suma el id de quien está haciendo la petición. Tambien hice los validadores necesarios para que la información sea correcta antes de enviarla al BackEnd.
En el BackEnd valido que la información recibida desde  el FrontEnd sea correcta, los email y nombres de usuario no se repitan y las fechas se guarden en el formato correcto. Tambien guardo las imagenes de perfil de los usuarios o asigno una por default si no cargan una propia.
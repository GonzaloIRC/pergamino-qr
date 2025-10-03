# Seguridad de Identidad y Control de Datos

Este proyecto implementa medidas para proteger la integridad y confidencialidad de los datos de clientes y perfiles. A partir del PR **feat/enforce-unique-dni** se aplican reglas estrictas de Firestore que garantizan lo siguiente:

* **Identificador único por DNI:** Cada cliente se almacena en la colección `Clientes` usando su **DNI** como ID de documento. Esto evita duplicidades y simplifica las consultas.
* **Creación controlada de clientes:** Para crear un documento `Clientes/{dni}` se requiere:
  * Que el ID del documento (`dni`) coincida con el campo `dni` del recurso enviado.
  * Que el campo `uid` del documento corresponda al usuario autenticado (`request.auth.uid`).
  * Que no exista previamente un documento con el mismo DNI en la colección.
* **Actualización restringida:** Solo el propietario del cliente puede modificar sus datos. Las actualizaciones verifican que el `dni` y el `uid` del documento coinciden con el usuario autenticado.
* **Colección de perfiles por usuario:** Se introduce `Perfiles/{uid}` para guardar información de perfil. Cada usuario puede leer y modificar exclusivamente su propio perfil (`uid == request.auth.uid`).

Estas reglas mitigan la creación duplicada de DNIs y garantizan que cada cliente esté asociado de forma única a un usuario. Además, se recomienda validar el formato y unicidad del DNI en el frontend (tanto en el panel de administración como en la app móvil) antes de realizar la solicitud al backend.
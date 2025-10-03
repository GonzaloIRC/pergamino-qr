# Cambio de Método de Autenticación

## Resumen

Se ha modificado el sistema de autenticación para usar el método `email/password` en lugar de `anonymous` para resolver el error `auth/admin-restricted-operation`. Este cambio evita la necesidad de activar la autenticación anónima en la consola de Firebase.

## Cambios Realizados

1. **AnonymousLogin.js**: 
   - Renombrado de funcionalidad a "Login de Prueba"
   - Reemplazado `signInAnonymously` por `signInWithEmailAndPassword` y `createUserWithEmailAndPassword`
   - Añadidos campos para email y contraseña con valores predeterminados
   - Añadido soporte para registro de usuario nuevo si no existe

2. **firebaseConnectionCheck.js**: 
   - Reemplazado el método de verificación de conexión para usar email/password
   - Configurado para usar credenciales predeterminadas (guest@pergamino.test)

3. **firebaseCredentialCheck.js**:
   - Reemplazado el método de verificación de credenciales para usar email/password
   - Añadida lógica para crear usuario de prueba si no existe

4. **firebase/app.js**:
   - Actualizado el objeto mock para reflejar los métodos de autenticación utilizados

## Credenciales de Prueba

- **Email**: `guest@pergamino.test`
- **Contraseña**: `pergamino123`

## Justificación

Este cambio resuelve el error `auth/admin-restricted-operation` que ocurría durante el proceso de registro. El método de autenticación anónima requiere una configuración específica en la consola de Firebase que puede no estar disponible en todos los entornos. Al cambiar a email/password, aprovechamos un método de autenticación que está habilitado por defecto en la mayoría de los proyectos Firebase.

## Instrucciones para Probar

1. Ejecutar la aplicación
2. En la pantalla de inicio, seleccionar "Acceder como invitado"
3. Usar las credenciales predeterminadas o ingresar nuevas
4. La aplicación debería permitir iniciar sesión o registrar un nuevo usuario

Si el usuario de prueba no existe, el sistema intentará crearlo automáticamente.

## Notas Adicionales

Este cambio es una solución temporal que permite continuar con el desarrollo y pruebas sin necesidad de configurar la autenticación anónima en Firebase. Para un entorno de producción, se recomienda revisar las políticas de autenticación según los requisitos del proyecto.

# Integración de Módulos Compartidos en Pergamino App

Este documento explica cómo se integra el módulo compartido `shared-firebase` en el ecosistema de aplicaciones de Pergamino.

## Estructura del Proyecto

```
/
├── apps/
│   ├── admin-web/        # Panel de administración (Next.js)
│   │   └── app/
│   │       └── lib/
│   │           └── shared-firebase.ts  # Proxy para importar funciones compartidas
│   └── mobile/           # Aplicación móvil (React Native)
├── packages/
│   └── shared-firebase/  # Módulo compartido
│       ├── customer.ts   # Funciones de gestión de clientes
│       ├── index.ts      # Exportaciones principales
│       └── package.json  # Configuración del paquete
```

## Configuración para Admin Web (Next.js)

### En tsconfig.json

Se ha configurado el path resolver en `apps/admin-web/tsconfig.json` para que pueda encontrar el módulo compartido:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "shared-firebase": ["../../packages/shared-firebase"],
      "shared-firebase/*": ["../../packages/shared-firebase/*"]
    }
  }
}
```

### En app/lib/shared-firebase.ts

Se ha creado un archivo proxy para simplificar las importaciones:

```typescript
import { 
  createCustomerWithDNI as createCustomer,
  reassignDNIByAdmin as reassignDNI,
  getCustomerByDNI as getCustomer
} from 'shared-firebase';

export const createCustomerWithDNI = createCustomer;
export const reassignDNIByAdmin = reassignDNI;
export const getCustomerByDNI = getCustomer;
```

### En componentes y páginas

En cualquier componente o página del panel de administración, se pueden importar las funciones así:

```typescript
import { createCustomerWithDNI, getCustomerByDNI } from '@/lib/shared-firebase';
```

## Configuración para Mobile (React Native)

Para la aplicación móvil, se debe añadir una configuración similar en el `metro.config.js` para que pueda encontrar el módulo compartido. Aquí hay un ejemplo de cómo configurarlo:

```javascript
// metro.config.js para React Native
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts: [...sourceExts, 'cjs'],
      extraNodeModules: {
        // Aquí se mapea el módulo compartido para que sea accesible desde la app móvil
        'shared-firebase': path.resolve(__dirname, '../../packages/shared-firebase'),
      },
    },
    watchFolders: [
      // Añadir la carpeta de packages para que Metro la observe
      path.resolve(__dirname, '../../packages'),
    ],
  };
})();
```

## Mantenimiento

Al actualizar las funciones compartidas:

1. Modifica los archivos en `packages/shared-firebase/`
2. Asegúrate de exportar cualquier nueva función en `index.ts`
3. Si es necesario, actualiza también el archivo proxy en `apps/admin-web/app/lib/shared-firebase.ts`

## Consideraciones de Despliegue

Para un despliegue en producción, considera:

1. Publicar el paquete `shared-firebase` como un paquete privado en NPM
2. O utilizar herramientas como Lerna o Nx para gestionar el monorepo
3. Si usas Vercel para desplegar Next.js, asegúrate de configurar correctamente los monorepos
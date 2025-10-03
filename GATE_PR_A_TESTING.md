# Guía para verificar los 4 checks del GATE PR A

Esta guía te ayudará a verificar manualmente que todos los checks del GATE PR A funcionan correctamente con el proyecto en flujo Managed (Expo 54) y con Reanimated 3.17.5.

## Checks a verificar

1. **Scanner con expo-camera + debounce 1.5s**
2. **BNF:{serial} => transacción estado activo->usado + Historial: canje**
3. **APP:{dni}:{nonce} => Historial: acumulacion**
4. **CRM Clientes, Seeds y Configuración**

## Preparación del entorno

1. Asegúrate de que el emulador de Firebase está corriendo:
   ```powershell
   npm run emulators:start
   ```

2. Asegúrate de que las semillas de datos están cargadas:
   ```powershell
   node scripts/seedEmulatorDemo.js
   ```

3. Inicia la aplicación en modo desarrollo:
   ```powershell
   npx expo start --dev-client
   ```

## Códigos QR para pruebas

### Formato BNF (Beneficios)

Usa estos códigos para probar el canje de beneficios:
- `BNF:SER-0001`
- `BNF:SER-0002`

### Formato APP (Acumulación de puntos)

Usa estos códigos para probar la acumulación de puntos:
- `APP:12345678:abc123`
- `APP:87654321:xyz789`

## Verificación manual

1. **Scanner con expo-camera + debounce 1.5s**:
   - Navega a la pantalla del scanner
   - Intenta escanear el mismo código QR varias veces rápidamente
   - Verifica que solo se procese una vez cada 1.5 segundos (debounce)

2. **BNF:{serial} => transacción estado activo->usado + Historial: canje**:
   - Escanea uno de los códigos BNF
   - Verifica que se muestre un mensaje de éxito
   - Verifica en la base de datos (emulador) que el estado del serial cambió de "activo" a "usado"
   - Verifica que se haya creado un registro en la colección "Historial" con tipo "canje"

3. **APP:{dni}:{nonce} => Historial: acumulacion**:
   - Escanea uno de los códigos APP
   - Verifica que se muestre un mensaje de éxito
   - Verifica en la base de datos (emulador) que se haya creado un registro en la colección "Historial" con tipo "acumulacion"

4. **CRM Clientes, Seeds y Configuración**:
   - Navega a la pantalla de Clientes
   - Verifica que se muestre el listado de clientes
   - Realiza una búsqueda en vivo
   - Verifica que los datos de los beneficios y seriales están correctamente configurados

## Conclusión

Si todos los checks anteriores pasan, significa que el proyecto ha sido correctamente refactorizado a un flujo Managed (Expo 54) y que todas las funcionalidades críticas siguen funcionando correctamente con Reanimated 3.17.5 en lugar de la versión 4.x.
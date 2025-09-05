# Informe de Compatibilidad

## Versiones de Compatibilidad

- Expo SDK: 53.0.22
- React Native: 0.79.5
- React: 19.0.0
- Node: 20.x
- Firebase: 12.2.1

## Dispositivos Compatibles

- Android 8.0+ (API 26+)
- iOS 13.4+
- Web (navegadores modernos)

## Problemas de Compatibilidad Resueltos

1. **Inicialización de Firebase**: Se ha centralizado en `src/services/firebaseClient.js`
2. **Paths de Android**: Corregidos para usar com.gonzaloirc.pergaminoapp
3. **Babel Config**: Configurado con react-native-reanimated/plugin al final
4. **Metro Config**: Configurado resolverMainFields para funcionar en Web/Android
5. **ESLint**: Configuración mínima funcional

## Estado Actual

La aplicación compila correctamente y se ejecuta en:
- ✅ Android
- ✅ Web
- ⚠️ iOS (pendiente de pruebas)

## Notas Adicionales

Se ha eliminado la dependencia de expo-barcode-scanner y se utiliza exclusivamente expo-camera para la funcionalidad de escaneo.

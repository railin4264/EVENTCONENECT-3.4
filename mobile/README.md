# 📱 EventConnect Mobile App

Aplicación móvil React Native para EventConnect, plataforma de descubrimiento de eventos y tribus.

## 🚀 Características

- **Autenticación**: Login y registro de usuarios
- **Navegación**: Stack + Tab navigation con React Navigation
- **Mapa Interactivo**: Integración con Google Maps y geolocalización
- **Eventos**: Lista, búsqueda y filtrado por categorías
- **Tribus**: Comunidades y grupos de interés
- **Perfil**: Gestión de perfil de usuario y estadísticas
- **Tema Oscuro**: Diseño moderno con tema oscuro por defecto

## 🛠️ Tecnologías

- **React Native** 0.72.6
- **Expo** ~49.0.0
- **React Navigation** 6.x
- **React Native Maps** 1.7.1
- **Expo Location** ~16.1.0
- **Zustand** 4.4.1 (State Management)
- **React Query** 3.39.3 (Data Fetching)

## 📱 Pantallas

### Autenticación
- **LoginScreen**: Inicio de sesión con email y contraseña
- **RegisterScreen**: Registro de nuevos usuarios

### Principales
- **HomeScreen**: Dashboard principal con acciones rápidas
- **MapScreen**: Mapa interactivo con eventos cercanos
- **EventsScreen**: Lista y búsqueda de eventos
- **TribesScreen**: Comunidades y grupos
- **ProfileScreen**: Perfil de usuario y configuración

## 🗺️ Funcionalidades del Mapa

- **Geolocalización**: Obtener ubicación actual del usuario
- **Marcadores**: Eventos mostrados como marcadores en el mapa
- **Interactividad**: Selección de eventos y información detallada
- **Google Maps**: Integración completa con Google Maps API

## 🎨 Diseño

- **Tema Oscuro**: Colores oscuros para mejor experiencia visual
- **Componentes Reutilizables**: Sistema de diseño consistente
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Iconos**: Emojis y iconos para mejor UX

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI
- Android Studio (para Android) o Xcode (para iOS)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd EventConnect/mobile
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear .env.local
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

4. **Ejecutar la aplicación**
```bash
npm start
```

## 🔧 Configuración

### Google Maps API
1. Obtener API key de [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
3. Configurar restricciones de dominio/IP

### Permisos
La aplicación requiere los siguientes permisos:
- **Ubicación**: Para mostrar eventos cercanos
- **Notificaciones**: Para alertas de eventos
- **Cámara**: Para fotos de perfil (futuro)

## 🚀 Desarrollo

### Estructura de Carpetas
```
src/
├── components/     # Componentes reutilizables
├── screens/        # Pantallas de la aplicación
│   ├── auth/      # Pantallas de autenticación
│   └── main/      # Pantallas principales
├── navigation/     # Configuración de navegación
├── contexts/       # Contextos de React
├── hooks/          # Hooks personalizados
├── services/       # Servicios de API
└── utils/          # Utilidades y helpers
```

### Scripts Disponibles
- `npm start`: Iniciar Expo development server
- `npm run android`: Ejecutar en Android
- `npm run ios`: Ejecutar en iOS
- `npm run web`: Ejecutar en web

## 🧪 Testing

### Pruebas Manuales
- [ ] Login/Registro
- [ ] Navegación entre pantallas
- [ ] Funcionalidad del mapa
- [ ] Búsqueda de eventos
- [ ] Gestión de tribus
- [ ] Perfil de usuario

### Pruebas de Integración
- [ ] Conexión con backend
- [ ] APIs de Google Maps
- [ ] Geolocalización
- [ ] Notificaciones push

## 📱 Build y Deploy

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### Web
```bash
expo build:web
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros para sesiones
- **Validación de Input**: Sanitización de datos de entrada
- **HTTPS**: Comunicación segura con backend
- **Permisos**: Control granular de permisos de usuario

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de Google Maps**
   - Verificar API key
   - Comprobar restricciones de dominio
   - Verificar facturación de Google Cloud

2. **Error de Geolocalización**
   - Verificar permisos de ubicación
   - Comprobar configuración del dispositivo
   - Verificar servicios de ubicación

3. **Error de Dependencias**
   - Limpiar cache: `npm start -- --clear`
   - Reinstalar node_modules: `rm -rf node_modules && npm install`

## 📚 Recursos

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Google Maps Platform](https://developers.google.com/maps)

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/username/repo/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/username/repo/wiki)
- **Email**: support@eventconnect.com

---

**Desarrollado con ❤️ por el equipo de EventConnect**
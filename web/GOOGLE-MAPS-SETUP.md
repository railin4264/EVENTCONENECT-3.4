# 🗺️ CONFIGURACIÓN DE GOOGLE MAPS - INSTRUCCIONES

## 📋 **PASOS PARA CONFIGURAR:**

### **1. Crea el archivo .env.local**
```bash
# En la carpeta web/, crea el archivo .env.local con este contenido:

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development

# Google Maps API Key (reemplaza con tu key real)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_GOOGLE_MAPS_API_KEY_AQUI

# Configuración de geolocalización
NEXT_PUBLIC_DEFAULT_LAT=40.4168
NEXT_PUBLIC_DEFAULT_LNG=-3.7038
NEXT_PUBLIC_DEFAULT_ZOOM=12
NEXT_PUBLIC_SEARCH_RADIUS_KM=10

# Configuración de eventos cercanos
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_AUTO_DETECT_LOCATION=true
```

### **2. Reemplaza TU_GOOGLE_MAPS_API_KEY_AQUI**
- Pega tu Google Maps API key real
- Ejemplo: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBo0jlvl0AGVhFiE6iOjnzWwDqYBVX`

### **3. Guarda el archivo**
- El archivo debe estar en: `web/.env.local`
- NO lo subas a GitHub (ya está en .gitignore)

## ✅ **DESPUÉS DE CONFIGURAR:**

1. **Reinicia el servidor de desarrollo**
2. **Ve a http://localhost:3000**
3. **Permite el acceso a ubicación cuando te lo pida**
4. **¡Verás eventos cercanos con Google Maps real!**

## 🎯 **FUNCIONALIDADES QUE VERÁS:**

- 📍 **Detección automática de ubicación**
- 🗺️ **Google Maps interactivo con marcadores**
- 📏 **Distancias reales calculadas**
- 🔄 **Switch entre vista grid y mapa**
- 🎯 **Filtros por categoría**
- 📱 **Totalmente responsive**

## ❌ **SI NO FUNCIONA:**

1. **Verifica que la API key sea correcta**
2. **Asegúrate que las APIs estén habilitadas en Google Cloud:**
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. **Revisa la consola del navegador para errores**
4. **Reinicia el servidor: Ctrl+C y luego npm run dev**

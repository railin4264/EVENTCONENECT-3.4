# 🧪 **GUÍA DE TESTING Y DEBUGGING - EventConnect**
## **Para Testing Real del Usuario**

---

## 🚀 **CÓMO EMPEZAR A PROBAR**

### **1. BACKEND - PROBAR PRIMERO**
```bash
cd /workspace/backend
npm install
npm start
```

**✅ Si funciona verás**:
```
🚀 Servidor ejecutándose en puerto 5000
📱 Entorno: development
🔗 API: http://localhost:5000/api
🏥 Health Check: http://localhost:5000/health
```

**❌ Si hay errores comunes**:
- **MongoDB error**: Normal, usa caché en memoria
- **Redis error**: Normal, usa fallback en memoria
- **Port 5000 busy**: Cambiar puerto en .env

### **2. FRONTEND WEB - PROBAR SEGUNDO**
```bash
cd /workspace/web
npm install
npm run dev
```

**✅ Si funciona verás**:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

**❌ Errores esperables**:
- **Build error**: Usar `npm run dev` (desarrollo funciona)
- **Module not found**: `npm install` otra vez
- **Port 3000 busy**: Next.js te ofrecerá otro puerto

### **3. APP MÓVIL - PROBAR TERCERO**
```bash
cd /workspace/mobile
npm install
npx expo start
```

**✅ Si funciona verás**:
```
Metro waiting on exp://192.168.1.100:8081
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

---

## 🔍 **QUÉ PROBAR ESPECÍFICAMENTE**

### **🗺️ MAPA INTERACTIVO WEB**
**URL**: `http://localhost:3000/map`

**Funcionalidades a probar**:
- ✅ **Carga del mapa**: ¿Se ve el mapa con marcadores?
- ✅ **Iconos por categoría**: ¿Cada evento tiene su icono correcto?
- ✅ **Click en marcadores**: ¿Se abre panel lateral con detalles?
- ✅ **Filtros**: ¿Los botones de categoría filtran eventos?
- ✅ **Búsqueda**: ¿El input filtra eventos en tiempo real?
- ✅ **Zoom**: ¿Los botones +/- funcionan?
- ✅ **Vista lista**: ¿El toggle mapa/lista funciona?
- ✅ **Responsive**: ¿Se ve bien en móvil?

**Errores posibles**:
- Componentes no se cargan → Falta importación
- Tipos TypeScript → Interfaces mal definidas
- Hooks no funcionan → useEvents/useGeolocation faltan

### **📱 MAPA MÓVIL**
**Abrir**: App móvil → Ir a pantalla de Mapa

**Funcionalidades a probar**:
- ✅ **Permisos ubicación**: ¿Pide permisos al abrir?
- ✅ **Marcadores animados**: ¿Aparecen con animación?
- ✅ **Haptic feedback**: ¿Vibra al tocar marcadores?
- ✅ **Modal evento**: ¿Se abre modal con detalles?
- ✅ **Filtros horizontales**: ¿Scroll horizontal funciona?
- ✅ **Tema oscuro**: ¿Cambia con el sistema?
- ✅ **Vista lista**: ¿Toggle funciona?
- ✅ **FAB ubicación**: ¿Aparece si deniegan permisos?

**Errores posibles**:
- Expo location no instalado → `expo install expo-location`
- Haptics no funcionan → Probar en dispositivo real
- Temas no cambian → Hook useTheme problema

### **🎮 GAMIFICACIÓN**
**URL Web**: `http://localhost:3000` (componentes integrados)
**Móvil**: Componentes en pantallas principales

**Funcionalidades a probar**:
- ✅ **Progress bars**: ¿Se ven barras de progreso?
- ✅ **Achievements**: ¿Se muestran logros desbloqueados?
- ✅ **Niveles**: ¿Se calcula nivel correctamente?
- ✅ **Leaderboard**: ¿Se ve ranking?
- ✅ **Puntos**: ¿Se actualizan puntos?

### **🔍 BÚSQUEDA INTELIGENTE**
**Componente**: SmartSearch en web y móvil

**Funcionalidades a probar**:
- ✅ **Debounced search**: ¿Espera 300ms antes de buscar?
- ✅ **Filtros avanzados**: ¿Categoría, fecha, precio funcionan?
- ✅ **Sugerencias**: ¿Se muestran sugerencias contextuales?
- ✅ **Resultados**: ¿Filtra eventos correctamente?

### **📊 ANALYTICS EN TIEMPO REAL**
**Componente**: RealTimeMetrics dashboard

**Funcionalidades a probar**:
- ✅ **Métricas live**: ¿Se actualizan números?
- ✅ **Gráficos**: ¿Se ven mini charts?
- ✅ **WebSocket**: ¿Datos cambian en tiempo real?

---

## 🐛 **ERRORES COMUNES Y SOLUCIONES**

### **❌ ERROR: "Module not found"**
```bash
# Solución
cd [directorio con error]
rm -rf node_modules package-lock.json
npm install
```

### **❌ ERROR: "Cannot find name 'Event'"**
```bash
# Problema: Tipos TypeScript
# Solución: Verificar imports
import { Event } from '@/types';
# o
import { Event } from '../types';
```

### **❌ ERROR: "useEvents is not a function"**
```bash
# Problema: Hook no existe
# Solución temporal: Usar mock data
const events = mockEventsWithCoordinates;
```

### **❌ ERROR: "expo-location not installed"**
```bash
cd mobile
expo install expo-location
```

### **❌ ERROR: "Port 5000 already in use"**
```bash
# Solución: Cambiar puerto
# En backend/.env cambiar:
PORT=5001
```

### **❌ ERROR: "Next.js build failed"**
```bash
# Solución: Solo usar dev mode
npm run dev  # En lugar de npm run build
```

### **❌ ERROR: "MongoDB connection failed"**
```bash
# Normal - usa caché en memoria
# Mensaje esperado: "Continuando sin base de datos (modo desarrollo)"
```

### **❌ ERROR: Componentes no se ven**
```bash
# Verificar que existan los archivos:
ls web/src/components/map/InteractiveEventMap.tsx
ls mobile/src/components/map/InteractiveEventMap.tsx
ls mobile/src/screens/MapScreen.tsx
```

---

## 📝 **CÓMO REPORTAR ERRORES**

### **🔴 ERRORES CRÍTICOS (App no funciona)**
**Formato del reporte**:
```
🚨 ERROR CRÍTICO:
Componente: [Mapa Web / Mapa Móvil / Backend / etc.]
Error exacto: [Copia el mensaje de error completo]
Pasos para reproducir:
1. Abrir [URL o pantalla]
2. Hacer clic en [elemento]
3. Error aparece

Consola del navegador: [F12 → Console → copiar errores]
```

### **🟡 ERRORES MENORES (Funciona pero mal)**
**Formato del reporte**:
```
⚠️ ERROR MENOR:
Problema: [Descripción de lo que no funciona bien]
Esperado: [Lo que debería pasar]
Actual: [Lo que pasa realmente]
Navegador: [Chrome/Safari/Firefox]
Dispositivo: [Desktop/iPhone/Android]
```

### **💡 MEJORAS SUGERIDAS**
```
💡 SUGERENCIA:
Componente: [Cual]
Mejora: [Descripción de la mejora]
Razón: [Por qué sería mejor]
```

---

## 🛠️ **HERRAMIENTAS DE DEBUGGING**

### **🌐 PARA WEB**
```bash
# Abrir DevTools
F12 → Console (para errores JavaScript)
F12 → Network (para errores de API)
F12 → Elements (para problemas CSS)
```

### **📱 PARA MÓVIL**
```bash
# Expo debugging
npx expo start --dev-client
# Luego en la app: shake device → Debug Remote JS
```

### **⚙️ PARA BACKEND**
```bash
# Ver logs en tiempo real
cd backend
npm start
# Los errores aparecen en la consola
```

---

## 📋 **CHECKLIST DE TESTING**

### **🎯 FUNCIONALIDADES CORE**
- [ ] Backend inicia sin errores críticos
- [ ] Frontend web carga en http://localhost:3000
- [ ] App móvil abre con Expo
- [ ] Navegación funciona en todas las apps

### **🗺️ MAPA INTERACTIVO**
- [ ] **Web**: Mapa carga en /map
- [ ] **Web**: Marcadores aparecen con iconos
- [ ] **Web**: Click en marcador abre panel
- [ ] **Web**: Filtros funcionan
- [ ] **Web**: Búsqueda filtra eventos
- [ ] **Móvil**: Mapa carga en MapScreen
- [ ] **Móvil**: Permisos de ubicación
- [ ] **Móvil**: Haptic feedback
- [ ] **Móvil**: Modal de evento
- [ ] **Móvil**: Filtros horizontales

### **🎮 GAMIFICACIÓN**
- [ ] Progress bars se muestran
- [ ] Achievements aparecen
- [ ] Niveles se calculan
- [ ] Puntos se actualizan

### **🔍 BÚSQUEDA**
- [ ] Búsqueda en tiempo real
- [ ] Filtros avanzados
- [ ] Sugerencias contextuales

### **📊 ANALYTICS**
- [ ] Métricas en tiempo real
- [ ] Gráficos se renderizan
- [ ] Datos se actualizan

---

## 🚀 **COMANDOS RÁPIDOS PARA TESTING**

### **🔄 REINICIAR TODO**
```bash
# Terminal 1 - Backend
cd /workspace/backend && npm start

# Terminal 2 - Frontend
cd /workspace/web && npm run dev

# Terminal 3 - Mobile
cd /workspace/mobile && npx expo start
```

### **🧹 LIMPIAR CACHÉ**
```bash
# Web
cd web && rm -rf .next node_modules && npm install

# Mobile
cd mobile && rm -rf node_modules && npm install
expo r -c  # Clear cache

# Backend
cd backend && rm -rf node_modules && npm install
```

### **📦 VERIFICAR INSTALACIÓN**
```bash
cd /workspace
node scripts/verify-app.js
```

---

## 🎯 **PRIORIDADES DE TESTING**

### **🔴 ALTA PRIORIDAD**
1. **Mapa web funciona** (core feature)
2. **Mapa móvil funciona** (core feature)  
3. **Backend responde** (base de todo)
4. **Navegación básica** (UX crítica)

### **🟡 MEDIA PRIORIDAD**
1. **Gamificación visual** (diferenciador)
2. **Búsqueda inteligente** (UX avanzada)
3. **Filtros avanzados** (funcionalidad)
4. **Animaciones** (polish)

### **🟢 BAJA PRIORIDAD**
1. **Analytics dashboard** (nice to have)
2. **Temas oscuros** (polish)
3. **Haptic feedback** (mobile specific)
4. **Performance optimizations** (ya implementado)

---

## 📞 **SOPORTE DURANTE TESTING**

**Cuando encuentres errores**:
1. **Copia el error exacto** (mensaje completo)
2. **Describe los pasos** para reproducirlo
3. **Incluye screenshots** si es visual
4. **Menciona el navegador/dispositivo** que usas

**Estaré aquí para**:
- ✅ **Arreglar errores** críticos inmediatamente
- ✅ **Explicar funcionalidades** que no estén claras
- ✅ **Optimizar performance** si es lento
- ✅ **Agregar features** que falten
- ✅ **Mejorar UX** basado en tu feedback

---

## 🎊 **¡EMPEZAMOS EL TESTING REAL!**

**EventConnect está listo para ser probado exhaustivamente. Cada error que encuentres nos acerca más a una app perfecta para el lanzamiento.**

**¡Vamos a hacer que EventConnect sea imparable! 🚀**
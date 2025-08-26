# 🧪 **GUÍA DE TESTING - EVENTCONNECT MOBILE**

## ✅ **ESTADO ACTUAL**

### **🎯 PROBLEMAS RESUELTOS:**
- ✅ **Expo SDK**: Dependencias actualizadas y sincronizadas
- ✅ **NPM Install**: Todas las dependencias instaladas correctamente
- ✅ **Socket.io-client**: Instalado para chat en tiempo real
- ✅ **Expo App**: Iniciado en background (`npx expo start`)

### **📱 FUNCIONALIDADES IMPLEMENTADAS:**
- ✅ **OAuth Login** (Google/Facebook) - *Requiere keys*
- ✅ **Sistema de Tribus** - *Listo para probar*
- ✅ **Feed de Posts** - *Listo para probar*
- ✅ **Notificaciones Push/In-app** - *Funciona con Expo*
- ✅ **Chat en Tiempo Real** - *Requiere backend*
- ✅ **Sistema de Reviews** - *Listo para probar*
- ✅ **Búsqueda Avanzada** - *Listo para probar*
- ✅ **Perfil Completo** - *Listo para probar*
- ✅ **Analytics** - *Listo para probar*

---

## 🔑 **APIs NECESARIAS AHORA MISMO**

### **🔥 CRÍTICAS (SIN ESTAS NO FUNCIONA):**

#### **1. Backend API** ⚠️ **NO FUNCIONA**
```
❌ http://localhost:5000 - NO RESPONDE
```
**ACCIÓN NECESARIA:** Iniciar el backend Node.js
```bash
cd ../backend  # o donde esté tu backend
npm start      # o npm run dev
```

#### **2. Google Maps API** ✅ **CONFIGURADO**
```
✅ AIzaSyDNN_nzVkisOiUq-O-3TT6vNYscXz5wkXo
```
**STATUS:** Funcionando para eventos cercanos y geolocalización

---

### **🟡 IMPORTANTES (PARA FUNCIONES AVANZADAS):**

#### **3. Google OAuth** ❌ **NECESARIO PARA LOGIN**
```
❌ EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
```
**CÓMO OBTENER:**
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Crear credenciales > OAuth 2.0 Client ID
3. Tipo: Aplicación Android
4. Package name: `com.eventconnect.app`
5. Agregar SHA-1 fingerprint de desarrollo
6. Copiar Client ID

#### **4. Facebook OAuth** ❌ **NECESARIO PARA LOGIN**
```
❌ EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here
```
**CÓMO OBTENER:**
1. Ve a: https://developers.facebook.com/
2. Crear App > Consumer
3. Productos > Facebook Login
4. Configuración > Android
5. Package Name: `com.eventconnect.app`
6. Copiar App ID

---

### **🔵 OPCIONALES (PARA PRODUCCIÓN):**

#### **5. Cloudinary** - *Para subir imágenes*
- **STATUS:** No crítico, usar placeholders por ahora

#### **6. Push Notifications**
- **STATUS:** ✅ Expo maneja automáticamente

#### **7. Analytics**
- **STATUS:** ✅ Implementado, funciona sin keys externas

---

## 🚀 **PLAN DE TESTING INMEDIATO**

### **FASE 1: TESTING BÁSICO (SIN OAUTH)**
```bash
# 1. Verificar que Expo está corriendo
npx expo start

# 2. Iniciar backend en otra terminal
cd ../backend
npm start

# 3. Testear en Expo Go o simulador:
```

**FUNCIONALIDADES TESTABLES:**
- ✅ Navegación entre pantallas
- ✅ Registro/Login básico (email/password)
- ✅ Lista de eventos (mock data)
- ✅ Sistema de tribus (crear/unirse)
- ✅ Feed de posts
- ✅ Notificaciones in-app
- ✅ Búsqueda avanzada
- ✅ Perfil de usuario

### **FASE 2: TESTING AVANZADO (CON BACKEND)**
**REQUERIMIENTOS:**
1. ✅ Backend funcionando en `localhost:5000`
2. ✅ Base de datos MongoDB conectada
3. ✅ Socket.IO para chat en tiempo real

**FUNCIONALIDADES ADICIONALES:**
- ✅ Chat en tiempo real
- ✅ Sincronización de datos
- ✅ Notificaciones push reales
- ✅ Geolocalización con eventos reales

### **FASE 3: TESTING COMPLETO (CON OAUTH)**
**REQUERIMIENTOS:**
1. ✅ Google OAuth Client ID configurado
2. ✅ Facebook App ID configurado
3. ✅ Certificados de desarrollo/producción

**FUNCIONALIDADES COMPLETAS:**
- ✅ Login con Google
- ✅ Login con Facebook
- ✅ Perfil social completo
- ✅ Compartir en redes sociales

---

## 🛠️ **CONFIGURACIÓN RÁPIDA**

### **Crear archivo `.env` en `mobile/`:**
```bash
# Copiar configuración básica
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDNN_nzVkisOiUq-O-3TT6vNYscXz5wkXo

# Opcional: OAuth (deshabilitado hasta configurar)
EXPO_PUBLIC_ENABLE_OAUTH_LOGIN=false
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_REAL_TIME_CHAT=true
```

### **Verificar que funciona:**
```bash
# En mobile/
npx expo start

# En otra terminal, backend/
npm start

# Abrir Expo Go en móvil y escanear QR
```

---

## 🔍 **DEBUGGING COMMON ISSUES**

### **"No se puede conectar al servidor"**
- ✅ Verificar que backend está corriendo: `http://localhost:5000`
- ✅ Verificar firewall/antivirus
- ✅ Probar con IP local: `http://192.168.x.x:5000`

### **"Google Maps no carga"**
- ✅ Verificar API key en `env.txt`
- ✅ Habilitar APIs necesarias en Google Console
- ✅ Verificar restricciones de aplicación

### **"Login social no funciona"**
- ✅ Configurar OAuth credentials
- ✅ Agregar SHA-1 fingerprint correcto
- ✅ Verificar Bundle ID/Package name

### **"Chat no funciona en tiempo real"**
- ✅ Verificar Socket.IO en backend
- ✅ Verificar puerto del socket (5000)
- ✅ Verificar que socket.io-client está instalado

---

## 📊 **RESUMEN DE ESTADO**

| **Funcionalidad** | **Status** | **Requisitos** |
|-------------------|:----------:|:---------------|
| **App Base** | ✅ | Ninguno |
| **Navegación** | ✅ | Ninguno |
| **Auth Básico** | ✅ | Backend |
| **OAuth Login** | ⚠️ | Google/FB Keys |
| **Google Maps** | ✅ | Key configurado |
| **Tribus** | ✅ | Backend |
| **Posts Feed** | ✅ | Backend |
| **Chat RT** | ⚠️ | Backend + Socket.IO |
| **Notificaciones** | ✅ | Expo automático |
| **Búsqueda** | ✅ | Backend |
| **Reviews** | ✅ | Backend |
| **Analytics** | ✅ | Ninguno |

---

## 🎯 **PRÓXIMOS PASOS RECOMENDADOS**

1. **🔥 INMEDIATO:** Iniciar el backend (`npm start` en directorio backend)
2. **🟡 IMPORTANTE:** Configurar Google OAuth si quieres probar login social
3. **🔵 OPCIONAL:** Configurar Facebook OAuth
4. **🚀 TESTING:** Probar todas las funcionalidades paso a paso

---

**🎉 ¡La app está lista para testing! Solo necesitas iniciar el backend para empezar a probar todas las funcionalidades implementadas!**










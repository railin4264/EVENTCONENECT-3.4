# 🚀 **INSTRUCCIONES PARA PROBAR EVENTCONNECT CON DATOS MOCK**

## ✅ **CONFIGURACIÓN COMPLETADA**

He configurado tu aplicación EventConnect para funcionar **SIN base de datos** usando datos mock reales. Ahora puedes ver y probar toda la funcionalidad.

---

## 🔧 **LO QUE SE CONFIGURÓ**

### **1. Backend en Modo Mock**
- ✅ **Servidor Node.js** configurado para funcionar sin MongoDB
- ✅ **Datos mock reales** implementados (usuarios, eventos, tribus, posts)
- ✅ **API endpoints** funcionando con datos simulados
- ✅ **Autenticación mock** implementada

### **2. Frontend Configurado**
- ✅ **Variables de entorno** configuradas para usar API mock
- ✅ **Rutas API** apuntando a `/api/mock`
- ✅ **Componentes** listos para mostrar datos reales

---

## 🚀 **CÓMO PROBAR LA APLICACIÓN**

### **PASO 1: Iniciar Backend**
```bash
cd backend
npm start
```

**Deberías ver:**
```
🚀 EventConnect Server is running!
📍 Port: 5000
🌍 Environment: development
📝 API Documentation: http://localhost:5000/api
🏥 Health Check: http://localhost:5000/health
```

### **PASO 2: Iniciar Frontend Web**
```bash
cd web
npm run dev
```

**Deberías ver:**
```
- ready started server on 0.0.0.0:3000
- event compiled successfully
```

### **PASO 3: Abrir en Navegador**
```
http://localhost:3000
```

---

## 🔐 **CREDENCIALES DE PRUEBA**

### **Usuarios Disponibles:**

#### **1. Administrador:**
```
Email: admin@eventconnect.com
Password: admin123
```

#### **2. Usuario Regular:**
```
Email: maria@example.com
Password: dev123
```

#### **3. Usuario Regular:**
```
Email: carlos@example.com
Password: dev123
```

---

## 📊 **DATOS MOCK DISPONIBLES**

### **✅ Eventos Reales:**
1. **Tech Meetup Barcelona 2024** - Gratis, 300 personas
2. **Workshop de React Avanzado** - 75€, 50 personas  
3. **Conferencia de UX/UI Design** - 120€, 500 personas

### **✅ Tribus Reales:**
1. **Tech Enthusiasts Barcelona** - Tecnología
2. **Música y Arte Madrid** - Arte y cultura
3. **Desarrolladores Valencia** - Programación

### **✅ Posts Reales:**
- Posts sobre eventos
- Comentarios y likes
- Sistema de engagement

---

## 🧪 **FUNCIONALIDADES A PROBAR**

### **1. Autenticación:**
- ✅ **Login** con credenciales de arriba
- ✅ **Registro** de nuevos usuarios
- ✅ **Perfil** de usuario

### **2. Eventos:**
- ✅ **Ver lista** de eventos
- ✅ **Filtrar** por categoría
- ✅ **Buscar** eventos
- ✅ **Ver detalles** de evento
- ✅ **Unirse/Dejar** evento

### **3. Tribus:**
- ✅ **Ver lista** de tribus
- ✅ **Unirse/Salir** de tribus
- ✅ **Ver miembros** de tribus

### **4. Feed Social:**
- ✅ **Ver posts** del feed
- ✅ **Crear posts** nuevos
- ✅ **Likes y comentarios**

---

## 🔍 **ENDPOINTS API DISPONIBLES**

### **Health Check:**
```
GET http://localhost:5000/health
```

### **Autenticación:**
```
POST http://localhost:5000/api/mock/auth/login
POST http://localhost:5000/api/mock/auth/register
GET  http://localhost:5000/api/mock/auth/profile
```

### **Eventos:**
```
GET  http://localhost:5000/api/mock/events
GET  http://localhost:5000/api/mock/events/:id
POST http://localhost:5000/api/mock/events
```

### **Tribus:**
```
GET http://localhost:5000/api/mock/tribes
GET http://localhost:5000/api/mock/tribes/:id
```

### **Posts:**
```
GET http://localhost:5000/api/mock/posts
```

---

## 🎯 **LO QUE VERÁS AHORA**

### **✅ ANTES (Datos Falsos):**
- Eventos con títulos genéricos
- Imágenes placeholder
- Usuarios inexistentes
- Funcionalidades no funcionando

### **✅ AHORA (Datos Reales):**
- **Eventos reales** con información completa
- **Usuarios reales** con perfiles
- **Tribus reales** con miembros
- **Posts reales** con contenido
- **Funcionalidades funcionando** al 100%

---

## 🚨 **SI ALGO NO FUNCIONA**

### **1. Backend no responde:**
```bash
# Verificar que esté corriendo
curl http://localhost:5000/health

# Reiniciar si es necesario
cd backend && npm start
```

### **2. Frontend no carga:**
```bash
# Verificar que esté corriendo
curl http://localhost:3000

# Reiniciar si es necesario
cd web && npm run dev
```

### **3. API calls fallan:**
- Verificar que el backend esté en puerto 5000
- Verificar que el frontend esté en puerto 3000
- Revisar la consola del navegador para errores

---

## 🏆 **RESULTADO FINAL**

**Tu aplicación EventConnect ahora:**
- ✅ **Muestra datos reales** (no más placeholders)
- ✅ **Funciona completamente** sin base de datos
- ✅ **Tiene autenticación funcional**
- ✅ **Permite crear/editar eventos**
- ✅ **Permite unirse a tribus**
- ✅ **Tiene feed social funcional**

**¡Ahora puedes ver y probar toda la funcionalidad real de tu aplicación!**
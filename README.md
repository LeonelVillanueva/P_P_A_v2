# Anime Saver - Gestor de Animes

Aplicación web para gestionar y organizar tus animes favoritos, desarrollada con Vue 3, Tailwind CSS y Supabase.

## 🚀 Características

- ✅ Gestión de animes en diferentes secciones (Vistos, Estrenos, Sin fecha, Emisión, En espera, Faltantes)
- 🖼️ Subida y almacenamiento de imágenes de portada
- 🏷️ Sistema de temporadas personalizable (1, 2, 3, Movie, OVA, Spin off, etc.)
- ⚙️ Configuración personalizada de estados y temporadas
- 🔍 Búsqueda de animes en API externa (Jikan/MyAnimeList)
- 🛡️ Validación y seguridad de datos
- 📱 Diseño responsive y moderno
- 🔐 Autenticación en servidor con tokens JWT

## 🛠️ Tecnologías

- **Vue 3** - Framework JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Pinia** - State management
- **Vue Router** - Routing
- **Supabase** - Backend (PostgreSQL + Storage)
- **Jikan API** - API externa de animes
- **Vercel** - Hosting y Serverless Functions

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia .env.example a .env y configura tus variables
```

## 🚀 Desarrollo

### **Opción 1: Ejecutar todo junto (Recomendado)**

```bash
npm run dev:all
```

Esto ejecuta tanto el servidor API de desarrollo como Vite en paralelo.

### **Opción 2: Ejecutar por separado**

**Terminal 1 - Servidor API:**
```bash
npm run dev:api
```

**Terminal 2 - Vite:**
```bash
npm run dev
```

## 🔐 Configuración de Autenticación

### **Variables de Entorno Requeridas:**

```env
# JWT Secret (genera uno con: npm run hash-password "tu-secret")
JWT_SECRET=tu-secret-seguro-aqui

# Contraseña o Hash
VITE_SITE_PASSWORD_HASH=tu-hash-aqui
# O
VITE_SITE_PASSWORD=tu-contraseña-aqui

# Supabase
VITE_SUPABASE_URL=tu-url-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### **Generar Hash de Contraseña:**

```bash
npm run hash-password "tu-contraseña"
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia Vite (solo frontend)
- `npm run dev:api` - Inicia servidor API de desarrollo
- `npm run dev:all` - Inicia ambos (API + Vite)
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run verify` - Verifica configuración de Supabase
- `npm run hash-password` - Genera hash de contraseña
- `npm run test-login` - Prueba configuración de login

## 🚀 Despliegue

### **Vercel**

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push

**Variables de entorno en Vercel:**
- `JWT_SECRET`
- `VITE_SITE_PASSWORD_HASH` o `VITE_SITE_PASSWORD`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📚 Documentación

Consulta la carpeta `docs/` para documentación detallada:

- `IMPLEMENTACION_AUTH_SERVIDOR.md` - Autenticación en servidor
- `SEGURIDAD_INTERCEPTS.md` - Seguridad contra intercepts
- `DESPLIEGUE_VERCEL.md` - Guía de despliegue
- `SETUP_DATABASE.md` - Configuración de base de datos

## 🔒 Seguridad

- ✅ Autenticación en servidor (Vercel Edge Functions)
- ✅ Tokens JWT seguros
- ✅ Validación de datos
- ✅ Headers de seguridad
- ✅ Supabase RLS (Row Level Security)

## 📄 Licencia

Proyecto personal - Uso privado

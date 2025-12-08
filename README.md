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

## 🛠️ Tecnologías

- **Vue 3** - Framework JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Pinia** - State management
- **Vue Router** - Routing
- **Supabase** - Backend (PostgreSQL + Storage)
- **Jikan API** - API externa de animes

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Verificar configuración
npm run verify
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

⚠️ **Nunca** expongas la `SERVICE_ROLE_KEY` en el cliente.

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Vercel detectará automáticamente el proyecto Vue
4. El archivo `vercel.json` configurará los headers de seguridad automáticamente

## 🔒 Seguridad

La aplicación incluye múltiples capas de seguridad:

- ✅ Validación de inputs en cliente y servidor
- ✅ Sanitización de datos
- ✅ Headers de seguridad (CSP, XSS Protection, etc.)
- ✅ Validación de archivos (tipo, tamaño)
- ✅ Rate limiting básico

**Importante**: Configura Row Level Security (RLS) en Supabase para protección completa. Ver `docs/SEGURIDAD.md` para más detalles.

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes Vue
├── composables/    # Lógica reutilizable
├── services/       # Servicios de API
├── stores/         # Estado global (Pinia)
├── utils/          # Utilidades (validación, formateo)
├── config/         # Configuración
└── views/          # Vistas/páginas
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run verify` - Verificar configuración de Supabase

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso personal.

## 🔗 Enlaces Útiles

- [Vue 3 Documentation](https://vuejs.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jikan API](https://docs.api.jikan.moe/)

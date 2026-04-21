# Hanare

Aplicacion web para gestionar contenido de anime con frontend moderno y API de apoyo.

## Caracteristicas

- Gestion de elementos por estado y temporada.
- Busqueda externa de contenido.
- Operaciones protegidas por autenticacion.
- Flujo de datos con endpoints de servidor.

## Desarrollo local

```bash
npm install
npm run dev:all
```

Tambien puedes correr por separado:

```bash
npm run dev:api
npm run dev
```

## Scripts utiles

- `npm run dev`
- `npm run dev:api`
- `npm run dev:all`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test`
- `npm run security:secrets`

## Configuracion

- Usa variables de entorno privadas para credenciales y secretos.
- No subas archivos `.env` al repositorio.
- Manten separados entornos de desarrollo, preview y produccion.

## Seguridad

- Autenticacion en servidor.
- CORS con allowlist configurable.
- Escaneo automatizado de secretos en CI.

## Licencia

Proyecto personal de uso privado.

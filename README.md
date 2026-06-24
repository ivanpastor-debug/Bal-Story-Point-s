# BALÚ TABLERO

Tablero web de **seguimiento de Historias de Usuario (HU)** para el proceso de desarrollo por etapas del proyecto BALÚ. Visualiza el avance del sprint a partir del `archivo_maestro.xlsx`, con KPIs, pipeline del proceso, cuellos de botella, carga por responsable, detalle de HU y alertas.

> Todo el procesamiento ocurre **en el navegador**. No hay backend ni base de datos: subes el Excel y el tablero se genera al vuelo. Nada se envía a un servidor.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Recharts** (gráficas) · **lucide-react** (iconos)
- **SheetJS (`xlsx`)** para leer el Excel en el cliente

## Cómo funciona

1. El usuario sube `archivo_maestro.xlsx` (snapshot del sprint a una fecha de corte).
2. `lib/parse.ts` lo lee, detecta dinámicamente las columnas de cycle time por etapa y construye el `Dataset`.
3. El catálogo de **etapas y ponderación** está embebido como dato fijo en `lib/etapas.ts` (17 etapas en 5 fases: Requerimiento → DEV → QA → Cliente → PMO Gerencia), así que solo se sube el archivo maestro.
4. `lib/metrics.ts` calcula los indicadores y `components/Dashboard.tsx` arma las vistas.

## Vistas

1. **Resumen / KPIs** — totales, cumplimiento, story points, cycle time promedio.
2. **Pipeline del proceso** — distribución de HU por las 17 etapas.
3. **Cuellos de botella** — cycle time por etapa.
4. **Carga por responsable** — HU y story points por persona.
5. **Detalle de HU** — tabla filtrable con barra de progreso.
6. **Alertas** — HU en devolución (puntaje negativo) y estancadas.

Filtros globales por **fase**, **responsable** y **estado de cumplimiento**.

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build de producción

```bash
npm run build
npm run start
```

## Despliegue en Vercel

El proyecto está listo para Vercel sin configuración adicional:

1. Sube el repositorio a GitHub (o conecta el directorio).
2. En Vercel: **New Project** → importa el repo → framework detectado: **Next.js**.
3. Deploy. No se requieren variables de entorno.

## Estructura

```
app/            # layout, página principal, estilos globales
components/     # Dashboard y vistas (KpiCards, PipelineChart, BottleneckChart, HuTable, ...)
lib/
  etapas.ts    # catálogo fijo de etapas + ponderación
  types.ts     # tipos (HU, Dataset)
  parse.ts     # lectura del Excel (SheetJS)
  metrics.ts   # cálculo de indicadores
```

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

1. **Resumen / KPIs** — totales, cumplimiento, puntos (Dev/QA), cycle time promedio.
2. **Pipeline del proceso** — distribución de HU por las 17 etapas.
3. **Puntos de función · Desarrollo vs QA** — esfuerzo separado visualmente: Story Points (desarrollo) y Effort QA, con totales, proporción y desglose por responsable y por fase.
4. **Cuellos de botella** — cycle time por etapa.
5. **Carga por responsable** — HU, puntos Dev, puntos QA y avance por persona.
6. **Detalle de HU** — tabla filtrable y ordenable, con columnas Dev y QA y barra de progreso.
7. **Alertas** — HU en devolución (puntaje negativo) y estancadas.

### Puntos de función: Desarrollo vs QA

El esfuerzo se divide en dos dimensiones tomadas del archivo maestro y se muestran **separadas y con color propio** en todo el tablero:

- 🟦 **Desarrollo** → columna `Story Points` (azul).
- 🟧 **QA** → columna `Effort (QA)` (ámbar).

### Filtros dinámicos

Filtros globales que recalculan todo el tablero en vivo:

- **Fase** del proceso · **Responsable** · **Estado** (cumplidas / pendientes).
- **Rango de fecha de inicio (t0)** — acota las HU por su fecha de inicio del cycle time.

### Acceso para actualizar

- Botón **Actualizar datos** en la cabecera para cargar un nuevo corte cuando cambie el `archivo_maestro.xlsx`.
- El último corte cargado **se guarda en el navegador** (localStorage) y se restaura al volver a abrir, con sello de **última actualización**.
- Botón **Limpiar** para descartar el corte guardado.

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

## GitHub + automatización

El repositorio incluye un workflow de **GitHub Actions** (`.github/workflows/ci.yml`) que en cada `push`/`pull_request` a `main`:

1. Instala dependencias con `npm ci`.
2. Compila con `npm run build` (falla el check si el build se rompe).

### Subir a GitHub por primera vez

```bash
# autenticarse (una sola vez)
gh auth login

# crear el repo remoto y empujar (desde la carpeta balu-tablero/)
gh repo create balu-tablero --private --source=. --remote=origin --push
```

> Sin `gh`: crea el repo vacío en github.com y luego
> `git remote add origin <url>` + `git push -u origin main`.

## Despliegue en Vercel (automático)

El proyecto está listo para Vercel sin configuración adicional:

1. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo de GitHub.
2. Framework detectado automáticamente: **Next.js**. No se requieren variables de entorno.
3. **Deploy**.

A partir de ahí, la integración Git de Vercel **despliega solo**: cada `push` a `main` genera un deploy de producción y cada PR un *preview deploy*. No hace falta CLI ni secretos.

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

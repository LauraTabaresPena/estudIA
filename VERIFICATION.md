# Verificación · 13 de octubre de 2026

Historia comprobada: el usuario configura un ciclo, estudia, registra su finalización y marca hitos; la UI conserva el progreso local y la capa de Supabase aplica acceso por propietario.

| Comprobación | Resultado |
| --- | --- |
| Instalación reproducible | `pnpm install --frozen-lockfile` correcto |
| TypeScript y producción | `pnpm build` correcto |
| Vista previa de producción | `http://127.0.0.1:4173/` abre correctamente, sin errores nuevos de consola |
| Pruebas automatizadas | 14 pruebas aprobadas en 4 archivos |
| Esquema SQL | Ejecutado en PostgreSQL/PGlite con roles Supabase simulados |
| Aislamiento | Dos usuarios: lectura, escritura cruzada, transferencia de propietario y acceso anónimo comprobados |
| Pomodoro | Ciclo real de 1 minuto en navegador; recarga a mitad de ciclo; resultado: 1 minuto y 1 sesión, sin duplicarse al recargar |
| Hitos | Crear, renderizar Markdown, completar, recargar, desmarcar y eliminar el hito de prueba comprobados |
| YouTube | Selección `aL4THIvtmiI`: URL correcta y controles reales del reproductor presentes |
| Diseño adaptable | Cuadrícula de tres columnas a 1440 px; una columna a 390 px; sin desbordamiento horizontal detectado |
| Preferencias | Cambio a Noche y restauración a Jardín comprobados |
| Cuenta sin configurar | Modal explica modo local y conexión pendiente |

Los errores transitorios de Fast Refresh al añadir un hook durante desarrollo no pertenecen a la compilación de producción; se resolvieron al recargar.

La compilación sin variables Supabase genera aproximadamente 118 KB gzip de JS y CSS en total, incluido el editor y el modal de acceso. El SDK autenticado se incluye al compilar con Supabase configurado, por lo que ese peso será mayor. No se incluyen fuentes remotas ni un iframe inicial de YouTube.

Pendiente de configuración externa: aplicar el SQL al proyecto elegido, añadir su URL y clave publishable, y ejecutar el recorrido de registro/acceso/sincronización descrito en README. No se ha creado ni modificado un proyecto remoto de Supabase ni publicado un despliegue de Vercel.

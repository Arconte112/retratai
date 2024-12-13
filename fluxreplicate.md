# Plan de Implementación: Integración de Replicate

## 1. Configuración Inicial

### Variables de Entorno
```env
NEXT_PUBLIC_TUNE_TYPE=replicate
REPLICATE_API_TOKEN=your_api_token
```

### Modelos de Replicate
- Crear modelo en Replicate para ser el destino del entrenamiento
- ID del modelo base: `ostris/flux-dev-lora-trainer`
- Versión: `e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497`

## 2. Modificaciones en la Interfaz

### Componente de Paquetes
- Modificar para mostrar solo dos opciones cuando `NEXT_PUBLIC_TUNE_TYPE=replicate`:
  1. "Foto Profesional" (activo)
  2. "Próximamente" (desactivado/gris)

### Reutilización de Componentes
- Mantener `TrainModelZone.tsx` como componente principal
- Conservar la lógica de subida de imágenes y validaciones
- Mantener la interfaz de usuario actual

### Modificaciones en la Interfaz
- Modificar el componente `TrainModelZone.tsx` para mostrar solo dos opciones de género:
  1. Hombre (man)
  2. Mujer (woman)
- Eliminar la opción "Unisex" del selector de tipo
- Actualizar las validaciones del formulario para aceptar solo "man" o "woman"

## 3. Backend Implementation

### Nuevo Endpoint: `/api/replicate/train-model`
```typescript
POST /api/replicate/train-model
{
  zipUrl: string,  // URL del archivo ZIP con las imágenes
  name: string,
  type: "man" | "woman"
}
```

### Manejo de Imágenes y ZIP
1. Proceso de Subida:
   ```typescript
   // 1. Subir imágenes individuales a Vercel Blob temporalmente
   // 2. Crear ZIP en memoria
   // 3. Subir ZIP a Vercel Blob
   // 4. Eliminar imágenes individuales temporales
   // 5. Usar URL del ZIP para Replicate
   ```

2. Dependencias Necesarias:
   ```json
   {
     "dependencies": {
       "jszip": "^3.10.1",
       "@vercel/blob": "^0.22.1"
     }
   }
   ```

3. Proceso de ZIP:
   ```typescript
   const createImageZip = async (files: File[]) => {
     const zip = new JSZip();
     
     // Agregar cada imagen al ZIP
     files.forEach((file, index) => {
       zip.file(`image_${index + 1}.${file.name.split('.').pop()}`, file);
     });
     
     // Generar ZIP
     const zipBlob = await zip.generateAsync({type: "blob"});
     return zipBlob;
   };
   ```

### Manejo de Webhooks y Notificaciones
```typescript
interface ReplicateWebhookPayload {
  status: "succeeded" | "failed" | "processing";
  output: {
    version_id: string;
    error?: string;
    detail?: string;
  }
}

// Manejador de Webhooks
const handleReplicateWebhook = async (payload: ReplicateWebhookPayload) => {
  if (payload.status === "succeeded") {
    // Actualizar estado del modelo
    // Enviar email de notificación
    // Limpiar archivos temporales
  } else if (payload.status === "failed") {
    // Manejar error y notificar al usuario
    // Realizar rollback si es necesario
  }
}
```

### Política de Limpieza de Archivos
```typescript
const cleanupPolicy = {
  // Eliminar ZIP después del entrenamiento exitoso
  deleteZipAfterTraining: true,
  // Periodo de retención para archivos temporales
  retentionPeriod: "24h",
  // Tamaño máximo permitido para el ZIP
  maxZipSize: "100MB"
}

const cleanupTemporaryFiles = async (modelId: string) => {
  // 1. Obtener lista de archivos temporales
  // 2. Verificar periodo de retención
  // 3. Eliminar archivos expirados
}
```

### Manejo de Errores
```typescript
type ReplicateError = {
  error: string;
  detail?: string;
  modelId?: string;
  stage?: "upload" | "training" | "completion"
}

const handleReplicateError = async (error: ReplicateError) => {
  // 1. Logging del error
  console.error(`Replicate error in ${error.stage}: ${error.error}`);
  
  // 2. Rollback si es necesario
  if (error.modelId) {
    await performRollback(error.modelId);
  }
  
  // 3. Notificar al usuario
  await notifyUserOfError(error);
}
```

### Validaciones Adicionales
```typescript
const validateZipFile = async (zipFile: Blob) => {
  // 1. Verificar tamaño máximo
  if (zipFile.size > MAX_ZIP_SIZE) {
    throw new Error("ZIP file too large");
  }
  
  // 2. Verificar contenido
  const validImageTypes = ["image/jpeg", "image/png"];
  // Verificar que todas las imágenes en el ZIP sean válidas
}
```

## 4. Prompts y Generación

### Reutilización de Prompts
Adaptar los prompts existentes:
```typescript
const prompts = [
  `portrait of ohwx ${triggerWord} wearing a business suit, professional photo, white background, Amazing Details, Best Quality, Masterpiece, dramatic lighting highly detailed, analog photo, overglaze, 80mm Sigma f/1.4 or any ZEISS lens`,
  `portrait of ohwx ${triggerWord}, 8k close up linkedin profile picture, professional jack suite, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, office window`
]
```

## 5. Base de Datos

### Modificaciones en la Tabla `models`
```sql
ALTER TABLE models
ADD COLUMN replicate_model_id VARCHAR(255),
ADD COLUMN replicate_version_id VARCHAR(255);
```

## 6. Plan de Implementación

### Fase 1: Configuración y Estructura
- [ ] Configurar variables de entorno
- [ ] Crear modelo en Replicate
- [ ] Modificar componente de paquetes
- [ ] Instalar dependencias necesarias (jszip)
- [ ] Crear nuevos endpoints

### Fase 2: Integración de Replicate y ZIP
- [ ] Implementar lógica de creación de ZIP
- [ ] Implementar sistema de almacenamiento temporal
- [ ] Implementar lógica de limpieza de archivos temporales
- [ ] Implementar lógica de entrenamiento
- [ ] Configurar webhooks

### Fase 3: Testing y Optimización
- [ ] Probar flujo completo
- [ ] Optimizar parámetros de entrenamiento
- [ ] Validar calidad de resultados

### Fase 4: Monitoreo y Mejoras
- [ ] Implementar sistema de logs
- [ ] Monitorear costos y uso
- [ ] Recopilar feedback de usuarios

## 7. Consideraciones de Seguridad

- Validar y sanitizar todas las entradas de usuario
- Implementar rate limiting
- Asegurar el manejo seguro de API keys
- Validar webhooks con secretos

### Seguridad de Archivos
- Implementar firma de URLs para archivos temporales
- Establecer TTL (Time To Live) para URLs de archivos
- Validar tipos MIME de archivos antes de procesamiento
- Escanear archivos en busca de malware antes de procesamiento

### Límites y Cuotas
- Establecer límite de solicitudes por usuario
- Implementar cooldown entre entrenamientos
- Monitorear uso de recursos por usuario
- Implementar sistema de cuotas de almacenamiento

## 8. Monitoreo y Logging

### Métricas a Monitorear
- Tiempo promedio de entrenamiento
- Tasa de éxito/fallo de entrenamientos
- Uso de almacenamiento temporal
- Consumo de créditos
- Latencia de procesamiento de webhooks

### Sistema de Logging
```typescript
interface TrainingLog {
  modelId: string;
  userId: string;
  stage: "upload" | "training" | "completion";
  status: "success" | "failure";
  duration: number;
  error?: string;
  metadata: {
    imageCount: number;
    zipSize: number;
    replicateVersion: string;
  }
}
```

## 9. Optimizaciones de Rendimiento

### Procesamiento de Imágenes
- Implementar compresión de imágenes antes de crear ZIP
- Optimizar formato de imágenes según requerimientos
- Implementar procesamiento en lotes para múltiples imágenes

### Caché y Almacenamiento
- Implementar caché de resultados frecuentes
- Optimizar almacenamiento de archivos temporales
- Implementar sistema de purga automática

## 10. Documentación

- Actualizar README con nuevas variables de entorno
- Documentar proceso de configuración de Replicate
- Crear guía de troubleshooting
- Documentar estructura de prompts y parámetros 
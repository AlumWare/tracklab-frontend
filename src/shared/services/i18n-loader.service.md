# Sistema de i18n Modular

## Estructura

```
src/
├── locales/                    # Traducciones por defecto (legacy)
│   ├── es.json                # Traducciones globales (español)
│   ├── en.json                # Traducciones globales (inglés)
│   └── index.js               # Exportaciones
├── shared/
│   ├── locales/
│   │   ├── es.json            # Traducciones compartidas (español)
│   │   ├── en.json            # Traducciones compartidas (inglés)
│   │   └── index.js           # Exportaciones
│   └── services/
│       └── i18n-loader.service.js  # Cargador automático
├── features/
│   ├── iam/
│   │   ├── locales/
│   │   │   ├── es.json        # Traducciones IAM (español)
│   │   │   ├── en.json        # Traducciones IAM (inglés)
│   │   │   └── index.js       # Exportaciones
│   │   └── ...
│   ├── orders/
│   │   ├── locales/
│   │   │   ├── es.json        # Traducciones Orders (español)
│   │   │   ├── en.json        # Traducciones Orders (inglés)
│   │   │   └── index.js       # Exportaciones
│   │   └── ...
│   └── ...
```

## Cómo agregar traducciones para un nuevo feature

1. **Crear la estructura de carpetas:**
   ```
   src/features/[feature-name]/locales/
   ├── es.json
   ├── en.json
   └── index.js
   ```

2. **Agregar el feature al cargador:**
   En `src/shared/services/i18n-loader.service.js`:
   ```javascript
   // Descomentar o agregar la línea:
   await this.loadFeatureTranslation(i18n, '[feature-name]', locale)
   ```

3. **Usar las traducciones:**
   ```vue
   <template>
     <div>{{ $t('featureName.section.key') }}</div>
   </template>
   ```

## Ejemplo de estructura de traducciones

```json
{
  "featureName": {
    "section": {
      "title": "Título",
      "description": "Descripción"
    },
    "actions": {
      "save": "Guardar",
      "cancel": "Cancelar"
    }
  }
}
```

## Orden de Carga

1. **Traducciones por defecto** (`/locales`) - Carga primero (legacy)
2. **Traducciones compartidas** (`/shared/locales`) - Sobrescribe las por defecto
3. **Traducciones de features** (`/features/*/locales`) - Sobrescribe las compartidas

## Beneficios

- ✅ **Compatibilidad**: Mantiene las traducciones existentes
- ✅ **Migración gradual**: Puedes mover traducciones poco a poco
- ✅ **Modular**: Cada feature tiene sus propias traducciones
- ✅ **Escalable**: Fácil agregar nuevos features
- ✅ **Mantenible**: Cambios aislados por feature
- ✅ **Automático**: Se cargan automáticamente
- ✅ **Fallback**: Si no encuentra un archivo, continúa sin error 
# Matching Turista <-> Guia

Este modulo recomienda perfiles compatibles y los muestra en orden de afinidad.
La idea es simple: primero salen los candidatos con mejor match real, pero siempre con paginacion para que la UI muestre variedad.

## Que hace el matching

Para cada candidato calcula un `score` de 0 a 100 y genera una explicacion:

- `score`: nivel total de compatibilidad.
- `matchedFields`: lista de campos que aportaron puntos (con evidencia y puntaje).
- `profilePreview`: datos basicos para pintar cards en UI.
- `totalCandidates`: total disponible para paginacion.

## Endpoints

### 1) Turista ve guias recomendados

`GET /api/matching/tourist/{touristUserId}/guides?limit=20&offset=0`

Ejemplo:

```bash
curl "http://localhost:8080/api/matching/tourist/15/guides?limit=10&offset=0"
```

### 2) Guia ve turistas recomendados

`GET /api/matching/guide/{guideUserId}/tourists?limit=20&offset=0`

Ejemplo:

```bash
curl "http://localhost:8080/api/matching/guide/8/tourists?limit=10&offset=0"
```

## Estructura de respuesta (resumen)

```json
{
  "results": [
    {
      "candidateUserId": 21,
      "score": 67.5,
      "matchedFields": [
        { "field": "Idiomas", "evidence": "espanol, english", "points": 16.67 },
        { "field": "Intereses/Experiencia", "evidence": "cultura, gastronomia", "points": 10.0 }
      ],
      "profilePreview": {
        "fullName": "Ana Torres",
        "avatarUrl": "https://...",
        "coverUrl": "https://...",
        "locationLabel": "CDMX Centro",
        "rating": 4.8,
        "reviewsCount": 24
      }
    }
  ],
  "totalCandidates": 54,
  "limit": 10,
  "offset": 0
}
```

## Reglas de score

Puntaje total (maximo 100):

- Idiomas: 25
- Intereses/Experiencia: 20
- Ritmo/Intensidad: 15
- Grupo: 10
- Transporte: 8
- Estilo: 8
- Fotos: 6
- Accesibilidad/Adaptaciones: 6
- Planeacion/Logistica: 2 (si no hay senal del guia, aporta 0)
- Bonus de notas: 0 a 2 (solo keywords seguras)

## Orden de resultados

Siempre se ordena asi:

1. `score DESC`
2. `matchedFieldsCount DESC`
3. `candidateUserId ASC` (desempate estable)

Despues de ordenar, se aplica `offset/limit`.

## Reglas de seguridad de datos

- Solo usa campos permitidos del onboarding.
- No usa religion.
- No usa orientacion sexual.
- No usa datos sensibles fuera de la lista permitida.

## Flujo recomendado para probar rapido

1. Levanta el backend.
2. Ejecuta uno de los endpoints con `limit=5`.
3. Verifica que el primer resultado tenga mayor `score` que los siguientes.
4. Cambia a `offset=5` y confirma que sigue el orden global.
5. Revisa `matchedFields` para mostrar explicaciones claras en UI.

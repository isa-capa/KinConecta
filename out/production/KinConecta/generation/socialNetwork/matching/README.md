# Matching Turista <-> Guia

Este modulo recomienda perfiles compatibles y los muestra en orden de afinidad.
La idea es simple: primero salen los candidatos con mejor match real, pero siempre con paginacion para que la UI muestre variedad.

## Que hace el matching

Para cada candidato calcula un `score` de 0 a 100 y genera una explicacion:

- `score`: nivel total de compatibilidad.
- `matchedFields`: lista de campos que aportaron puntos (con evidencia y puntaje).
- `profilePreview`: datos basicos para pintar cards en UI.
- `totalCandidates`: total disponible para paginacion.


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


## Activar el codigo (paso a paso)

### 1) Configurar backend

En `src/main/resources/application.properties` revisa tu conexion a MySQL:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

Para pruebas locales, usa temporalmente:

```properties
spring.jpa.hibernate.ddl-auto=update
```

### 2) Compilar y levantar

Desde la carpeta `socialNetwork`:

```bash
./gradlew test --no-daemon --console=plain
./gradlew bootRun
```

En Windows PowerShell:

```powershell
.\gradlew.bat test --no-daemon --console=plain
.\gradlew.bat bootRun
```

### 3) Cargar esquema y seed

Desde terminal:

```bash
mysql -u root -p kin_conecta < ../kinConnect.sql
mysql -u root -p kin_conecta < ../seed_kinconecta_5_registros.sql
```

## Probar matching con datos reales

Nota: el seed base trae principalmente guias. Para probar `guide -> tourists` agrega turistas en la tabla `users` con rol `tourist`.

Ejemplo SQL:

```sql
USE kin_conecta;

INSERT INTO users (user_id, role, full_name, email, password_hash, account_status)
VALUES
(101, 'tourist', 'Turista Demo Uno', 'turista101@kinconecta.test', '$2b$12$demo.hash.101', 'active'),
(102, 'tourist', 'Turista Demo Dos', 'turista102@kinconecta.test', '$2b$12$demo.hash.102', 'active');

INSERT INTO tourist_profiles (
  user_id, location, travel_style, trip_type, pace_and_company, activity_level,
  group_preference, dietary_preferences, planning_level, amenities, transport,
  photo_preference, accessibility, additional_notes
) VALUES
(101, 'CDMX', 'Cultural', 'City break', 'Ritmo moderado', 'Moderado',
 'Grupos pequenos', 'Sin restricciones', 'Intermedio', 'Agua',
 'Caminata y metro', 'Arquitectura', 'Sin requerimientos', 'cultura museos'),
(102, 'Guadalajara', 'Gastronomico', 'Fin de semana', 'Ritmo relajado', 'Bajo',
 'Pareja o trio', 'Vegetariano', 'Bajo', 'Paradas comida',
 'Auto y caminata', 'Comida y retratos', 'Sin requerimientos', 'gastronomia familia');

INSERT INTO tourist_profile_languages (user_id, language_code) VALUES
(101, 'es'), (101, 'en'),
(102, 'es');

INSERT INTO tourist_profile_interests (user_id, interest_id) VALUES
(101, 1), (101, 5),
(102, 2);
```

### Requests de prueba

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:8080/api/matching/tourist/101/guides?limit=5&offset=0"
Invoke-RestMethod "http://localhost:8080/api/matching/guide/1/tourists?limit=5&offset=0"
```

curl:

```bash
curl "http://localhost:8080/api/matching/tourist/101/guides?limit=5&offset=0"
curl "http://localhost:8080/api/matching/guide/1/tourists?limit=5&offset=0"
```

### Que validar en la respuesta

1. `results` viene ordenado por `score` descendente.
2. `matchedFields` solo trae campos con puntos mayores a 0.
3. `totalCandidates` refleja el total real de candidatos.
4. `offset/limit` pagina correctamente sin romper el orden global.

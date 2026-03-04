package org.generation.socialNetwork.matching.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MatchingScoringEngineTest {

    private final MatchingScoringEngine engine = new MatchingScoringEngine();

    @Test
    void scoreShouldAddPointsForTypicalMatch() {
        MatchingProfiles.TouristMatchingData tourist = new MatchingProfiles.TouristMatchingData(
                10L,
                "Turista Demo",
                null,
                null,
                "Ciudad de Mexico",
                Set.of("Espanol", "English"),
                Set.of("cultura", "gastronomia"),
                "cultural y gastronomico",
                "city break",
                "ritmo moderado",
                "Moderado",
                "grupos pequenos",
                "sin restricciones",
                "Intermedio",
                "agua",
                "caminata y metro",
                "arquitectura",
                "sin requerimientos",
                "me interesa cultura y museos"
        );

        MatchingProfiles.GuideMatchingData guide = new MatchingProfiles.GuideMatchingData(
                20L,
                "Guia Demo",
                null,
                null,
                "CDMX Centro",
                BigDecimal.valueOf(4.9),
                100,
                Set.of("Espanol", "English", "Francais"),
                Set.of("historia cultural", "tour gastronomico"),
                Set.of("Centro Historico"),
                "Senior",
                "explicaciones culturales",
                "4-8 personas",
                "moderado",
                "caminata",
                Set.of("certificado cultural"),
                Set.of("sin requerimientos"),
                "arquitectura y retrato",
                "museos y cultura"
        );

        MatchingScoringEngine.ScoringResult result = engine.score(tourist, guide);

        assertTrue(result.score() > 40.0);
        assertTrue(result.matchedFieldsCount() >= 5);
        assertTrue(result.matchedFields().stream().anyMatch(field -> field.field().equals("Idiomas")));
        assertTrue(result.matchedFields().stream().anyMatch(field -> field.field().equals("Intereses/Experiencia")));
    }

    @Test
    void scoreShouldBeZeroWhenNoData() {
        MatchingProfiles.TouristMatchingData tourist = new MatchingProfiles.TouristMatchingData(
                1L, "A", null, null, null,
                Set.of(), Set.of(),
                null, null, null, null, null, null, null, null, null, null, null, null
        );
        MatchingProfiles.GuideMatchingData guide = new MatchingProfiles.GuideMatchingData(
                2L, "B", null, null, null, null, null,
                Set.of(), Set.of(), Set.of(),
                null, null, null, null, null, Set.of(), Set.of(), null, null
        );

        MatchingScoringEngine.ScoringResult result = engine.score(tourist, guide);

        assertEquals(0.0, result.score());
        assertEquals(0, result.matchedFieldsCount());
        assertTrue(result.matchedFields().isEmpty());
    }
}

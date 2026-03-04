package org.generation.socialNetwork.matching.service;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MatchingTextUtilsTest {

    @Test
    void normalizeShouldLowercaseAndStandardizeSpacing() {
        String value = "  Aventura,   CULTURA|Museos  ";

        String normalized = MatchingTextUtils.normalize(value);

        assertEquals("aventura cultura museos", normalized);
    }

    @Test
    void toTokenSetShouldRemoveStopwordsAndShortTokens() {
        Set<String> tokens = MatchingTextUtils.toTokenSet("de la cultura y aventura en mx");

        assertTrue(tokens.contains("cultura"));
        assertTrue(tokens.contains("aventura"));
        assertTrue(tokens.contains("mx"));
        assertFalse(tokens.contains("de"));
    }

    @Test
    void jaccardShouldScoreIntersectionOverUnion() {
        Set<String> left = new LinkedHashSet<>(Set.of("es", "en", "fr"));
        Set<String> right = new LinkedHashSet<>(Set.of("es", "it"));

        double ratio = MatchingTextUtils.jaccard(left, right);

        assertEquals(0.25, ratio);
    }
}

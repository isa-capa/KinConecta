package org.generation.socialNetwork.matching.service;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class MatchingTextUtils {

    private static final Set<String> STOPWORDS = Set.of(
            "de", "la", "el", "los", "las", "y", "en", "con", "para", "por", "del", "al", "un", "una",
            "the", "and", "with", "for", "from", "into"
    );

    private MatchingTextUtils() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String lowered = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT);

        return lowered
                .replaceAll("[\\r\\n\\t]+", " ")
                .replaceAll("[,;|/\\\\]+", " ")
                .replaceAll("[^\\p{IsAlphabetic}\\p{IsDigit} ]+", " ")
                .trim()
                .replaceAll("\\s{2,}", " ");
    }

    public static Set<String> toTokenSet(String value) {
        String normalized = normalize(value);
        if (normalized.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(normalized.split(" "))
                .map(String::trim)
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOPWORDS.contains(token))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public static Set<String> normalizeSet(Set<String> source) {
        if (source == null || source.isEmpty()) {
            return Collections.emptySet();
        }
        return source.stream()
                .map(MatchingTextUtils::normalize)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public static Set<String> tokenizeSet(Set<String> source) {
        if (source == null || source.isEmpty()) {
            return Collections.emptySet();
        }
        LinkedHashSet<String> tokens = new LinkedHashSet<>();
        for (String value : source) {
            tokens.addAll(toTokenSet(value));
        }
        return tokens;
    }

    public static double jaccard(Set<String> a, Set<String> b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        Set<String> intersection = new LinkedHashSet<>(a);
        intersection.retainAll(b);
        if (intersection.isEmpty()) {
            return 0.0;
        }
        Set<String> union = new LinkedHashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0.0 : ((double) intersection.size()) / union.size();
    }

    public static Set<String> intersection(Set<String> a, Set<String> b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) {
            return Collections.emptySet();
        }
        Set<String> intersection = new LinkedHashSet<>(a);
        intersection.retainAll(b);
        return intersection;
    }

    public static String joinEvidence(Set<String> evidence) {
        if (evidence == null || evidence.isEmpty()) {
            return "";
        }
        return String.join(", ", evidence);
    }
}

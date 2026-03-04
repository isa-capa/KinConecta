package generation.socialNetwork.matching.service;

import org.generation.socialNetwork.matching.dto.MatchedFieldDTO;
import org.generation.socialNetwork.matching.service.MatchingProfiles;
import org.generation.socialNetwork.matching.service.MatchingTextUtils;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MatchingScoringEngine {

    private static final double MAX_LANGUAGE = 25.0;
    private static final double MAX_INTEREST_EXPERTISE = 20.0;
    private static final double MAX_INTENSITY = 15.0;
    private static final double MAX_GROUP = 10.0;
    private static final double MAX_TRANSPORT = 8.0;
    private static final double MAX_STYLE = 8.0;
    private static final double MAX_PHOTO = 6.0;
    private static final double MAX_ACCESSIBILITY = 6.0;
    private static final double MAX_PLANNING = 2.0;
    private static final double MAX_NOTES_BONUS = 2.0;

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d+");
    private static final Set<String> SAFE_KEYWORDS = Set.of(
            "familia", "aventura", "cultura", "gastronomia", "naturaleza", "museos"
    );

    public ScoringResult score(MatchingProfiles.TouristMatchingData tourist, MatchingProfiles.GuideMatchingData guide) {
        List<MatchedFieldDTO> matchedFields = new ArrayList<>();
        double total = 0.0;

        total += addSetJaccardScore(
                matchedFields,
                "Idiomas",
                MatchingTextUtils.normalizeSet(tourist.languages()),
                MatchingTextUtils.normalizeSet(guide.languages()),
                MAX_LANGUAGE
        );

        total += addInterestExpertiseScore(matchedFields, tourist.interests(), guide.expertiseAreas());
        total += addIntensityScore(matchedFields, tourist.activityLevel(), guide.tourIntensity());
        total += addGroupScore(matchedFields, tourist.groupPreference(), guide.groupSize());
        total += addTokenOverlapScore(matchedFields, "Transporte", tourist.transport(), guide.transportOffered(), MAX_TRANSPORT);
        total += addTokenOverlapScore(matchedFields, "Estilo", tourist.travelStyle(), guide.style(), MAX_STYLE);
        total += addTokenOverlapScore(matchedFields, "Fotos", tourist.photoPreference(), guide.photoStyle(), MAX_PHOTO);
        total += addAccessibilityScore(matchedFields, tourist.accessibility(), guide.adaptations(), guide.additionalNotes());
        total += addPlanningScore(matchedFields, tourist.planningLevel(), null);
        total += addNotesKeywordBonus(matchedFields, tourist.additionalNotes(), guide.additionalNotes());

        double bounded = Math.min(100.0, total);
        double rounded = round(bounded);

        List<MatchedFieldDTO> sortedFields = matchedFields.stream()
                .sorted(Comparator.comparingDouble(MatchedFieldDTO::points).reversed())
                .toList();

        return new ScoringResult(rounded, sortedFields.size(), sortedFields);
    }

    private double addSetJaccardScore(List<MatchedFieldDTO> matchedFields,
                                      String fieldName,
                                      Set<String> left,
                                      Set<String> right,
                                      double maxPoints) {
        double ratio = MatchingTextUtils.jaccard(left, right);
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(maxPoints * ratio);
        Set<String> overlap = MatchingTextUtils.intersection(left, right);
        matchedFields.add(new MatchedFieldDTO(fieldName, MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private double addInterestExpertiseScore(List<MatchedFieldDTO> matchedFields,
                                             Set<String> interests,
                                             Set<String> expertiseAreas) {
        Set<String> interestTokens = MatchingTextUtils.tokenizeSet(interests);
        Set<String> expertiseTokens = MatchingTextUtils.tokenizeSet(expertiseAreas);
        FuzzyOverlap overlap = fuzzyOverlap(interestTokens, expertiseTokens);
        double ratio = overlap.ratio();
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(MAX_INTEREST_EXPERTISE * ratio);
        matchedFields.add(new MatchedFieldDTO("Intereses/Experiencia", MatchingTextUtils.joinEvidence(overlap.evidence()), points));
        return points;
    }

    private FuzzyOverlap fuzzyOverlap(Set<String> left, Set<String> right) {
        if (left == null || right == null || left.isEmpty() || right.isEmpty()) {
            return new FuzzyOverlap(0.0, Set.of());
        }
        Set<String> usedRight = new HashSet<>();
        Set<String> evidence = new LinkedHashSet<>();
        int matches = 0;

        for (String leftToken : left) {
            for (String rightToken : right) {
                if (usedRight.contains(rightToken)) {
                    continue;
                }
                if (tokensAreSimilar(leftToken, rightToken)) {
                    matches++;
                    usedRight.add(rightToken);
                    evidence.add(leftToken);
                    break;
                }
            }
        }

        if (matches == 0) {
            return new FuzzyOverlap(0.0, Set.of());
        }
        int union = left.size() + right.size() - matches;
        double ratio = union <= 0 ? 0.0 : ((double) matches) / union;
        return new FuzzyOverlap(ratio, evidence);
    }

    private boolean tokensAreSimilar(String leftToken, String rightToken) {
        if (leftToken.equals(rightToken)) {
            return true;
        }
        int minLength = Math.min(leftToken.length(), rightToken.length());
        return minLength >= 4 && (leftToken.startsWith(rightToken) || rightToken.startsWith(leftToken));
    }

    private double addIntensityScore(List<MatchedFieldDTO> matchedFields,
                                     String touristActivityLevel,
                                     String guideTourIntensity) {
        Integer touristLevel = parseIntensityLevel(touristActivityLevel);
        Integer guideLevel = parseIntensityLevel(guideTourIntensity);
        if (touristLevel == null || guideLevel == null) {
            return 0.0;
        }
        int distance = Math.abs(touristLevel - guideLevel);
        double ratio;
        if (distance == 0) {
            ratio = 1.0;
        } else if (distance == 1) {
            ratio = 0.6;
        } else {
            ratio = 0.2;
        }
        double points = round(MAX_INTENSITY * ratio);
        if (points <= 0.0) {
            return 0.0;
        }
        String evidence = "turista: " + MatchingTextUtils.normalize(touristActivityLevel)
                + ", guia: " + MatchingTextUtils.normalize(guideTourIntensity);
        matchedFields.add(new MatchedFieldDTO("Ritmo/Intensidad", evidence, points));
        return points;
    }

    private Integer parseIntensityLevel(String text) {
        String normalized = MatchingTextUtils.normalize(text);
        if (normalized.isBlank()) {
            return null;
        }
        if (containsAny(normalized, "bajo", "relajado", "tranquilo", "suave")) {
            return 1;
        }
        if (containsAny(normalized, "moderado", "medio", "balanceado")) {
            return 2;
        }
        if (containsAny(normalized, "alto", "intenso", "activa", "activo", "fuerte")) {
            return 3;
        }
        return null;
    }

    private double addGroupScore(List<MatchedFieldDTO> matchedFields,
                                 String groupPreference,
                                 String groupSize) {
        Set<String> touristTokens = enrichGroupTokens(groupPreference);
        Set<String> guideTokens = enrichGroupTokens(groupSize);
        double ratio = MatchingTextUtils.jaccard(touristTokens, guideTokens);
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(MAX_GROUP * ratio);
        Set<String> overlap = MatchingTextUtils.intersection(touristTokens, guideTokens);
        matchedFields.add(new MatchedFieldDTO("Grupo", MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private Set<String> enrichGroupTokens(String value) {
        Set<String> tokens = new LinkedHashSet<>(MatchingTextUtils.toTokenSet(value));
        String normalized = MatchingTextUtils.normalize(value);
        if (containsAny(normalized, "solo")) {
            tokens.add("solo");
            tokens.add("pareja");
        }
        if (containsAny(normalized, "pareja", "duo")) {
            tokens.add("pareja");
        }
        if (containsAny(normalized, "pequeno", "pequena", "small")) {
            tokens.add("grupo_pequeno");
        }
        if (containsAny(normalized, "grande", "large")) {
            tokens.add("grupo_grande");
        }
        List<Integer> numbers = extractNumbers(normalized);
        if (!numbers.isEmpty()) {
            int max = numbers.stream().max(Integer::compareTo).orElse(0);
            if (max <= 2) {
                tokens.add("pareja");
            } else if (max <= 6) {
                tokens.add("grupo_pequeno");
            } else if (max <= 12) {
                tokens.add("grupo_mediano");
            } else {
                tokens.add("grupo_grande");
            }
        }
        return tokens;
    }

    private List<Integer> extractNumbers(String text) {
        List<Integer> numbers = new ArrayList<>();
        Matcher matcher = NUMBER_PATTERN.matcher(text);
        while (matcher.find()) {
            numbers.add(Integer.parseInt(matcher.group()));
        }
        return numbers;
    }

    private double addTokenOverlapScore(List<MatchedFieldDTO> matchedFields,
                                        String fieldName,
                                        String leftText,
                                        String rightText,
                                        double maxPoints) {
        Set<String> left = MatchingTextUtils.toTokenSet(leftText);
        Set<String> right = MatchingTextUtils.toTokenSet(rightText);
        double ratio = MatchingTextUtils.jaccard(left, right);
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(maxPoints * ratio);
        Set<String> overlap = MatchingTextUtils.intersection(left, right);
        matchedFields.add(new MatchedFieldDTO(fieldName, MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private double addAccessibilityScore(List<MatchedFieldDTO> matchedFields,
                                         String touristAccessibility,
                                         Set<String> guideAdaptations,
                                         String guideAdditionalNotes) {
        Set<String> touristTokens = MatchingTextUtils.toTokenSet(touristAccessibility);
        Set<String> adaptationTokens = new LinkedHashSet<>(MatchingTextUtils.tokenizeSet(guideAdaptations));
        adaptationTokens.addAll(MatchingTextUtils.toTokenSet(guideAdditionalNotes));
        double ratio = MatchingTextUtils.jaccard(touristTokens, adaptationTokens);
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(MAX_ACCESSIBILITY * ratio);
        Set<String> overlap = MatchingTextUtils.intersection(touristTokens, adaptationTokens);
        matchedFields.add(new MatchedFieldDTO("Accesibilidad/Adaptaciones", MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private double addPlanningScore(List<MatchedFieldDTO> matchedFields,
                                    String touristPlanningLevel,
                                    String guidePlanningSignal) {
        if (guidePlanningSignal == null || guidePlanningSignal.isBlank()) {
            return 0.0;
        }
        Set<String> tourist = MatchingTextUtils.toTokenSet(touristPlanningLevel);
        Set<String> guide = MatchingTextUtils.toTokenSet(guidePlanningSignal);
        double ratio = MatchingTextUtils.jaccard(tourist, guide);
        if (ratio <= 0.0) {
            return 0.0;
        }
        double points = round(MAX_PLANNING * ratio);
        Set<String> overlap = MatchingTextUtils.intersection(tourist, guide);
        matchedFields.add(new MatchedFieldDTO("Planeacion/Logistica", MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private double addNotesKeywordBonus(List<MatchedFieldDTO> matchedFields,
                                        String touristNotes,
                                        String guideNotes) {
        Set<String> touristTokens = MatchingTextUtils.toTokenSet(touristNotes);
        Set<String> guideTokens = MatchingTextUtils.toTokenSet(guideNotes);

        Set<String> touristSafe = touristTokens.stream().filter(SAFE_KEYWORDS::contains).collect(LinkedHashSet::new, Set::add, Set::addAll);
        Set<String> guideSafe = guideTokens.stream().filter(SAFE_KEYWORDS::contains).collect(LinkedHashSet::new, Set::add, Set::addAll);

        Set<String> overlap = MatchingTextUtils.intersection(touristSafe, guideSafe);
        if (overlap.isEmpty()) {
            return 0.0;
        }
        double points = overlap.size() >= 2 ? MAX_NOTES_BONUS : 1.0;
        matchedFields.add(new MatchedFieldDTO("Bonus notas", MatchingTextUtils.joinEvidence(overlap), points));
        return points;
    }

    private boolean containsAny(String text, String... values) {
        String normalized = MatchingTextUtils.normalize(text);
        for (String value : values) {
            if (normalized.contains(value.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public record ScoringResult(
            double score,
            int matchedFieldsCount,
            List<MatchedFieldDTO> matchedFields
    ) {
    }

    private record FuzzyOverlap(double ratio, Set<String> evidence) {
    }
}

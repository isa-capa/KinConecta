package org.generation.socialNetwork.matching.service;

import java.math.BigDecimal;
import java.util.Set;

public final class MatchingProfiles {

    private MatchingProfiles() {
    }

    public record TouristMatchingData(
            Long userId,
            String fullName,
            String avatarUrl,
            String coverUrl,
            String location,
            Set<String> languages,
            Set<String> interests,
            String travelStyle,
            String tripType,
            String paceAndCompany,
            String activityLevel,
            String groupPreference,
            String dietaryPreferences,
            String planningLevel,
            String amenities,
            String transport,
            String photoPreference,
            String accessibility,
            String additionalNotes
    ) {
    }

    public record GuideMatchingData(
            Long userId,
            String fullName,
            String avatarUrl,
            String coverUrl,
            String locationLabel,
            BigDecimal ratingAvg,
            Integer reviewsCount,
            Set<String> languages,
            Set<String> expertiseAreas,
            Set<String> locations,
            String experienceLevel,
            String style,
            String groupSize,
            String tourIntensity,
            String transportOffered,
            Set<String> certifications,
            Set<String> adaptations,
            String photoStyle,
            String additionalNotes
    ) {
    }
}

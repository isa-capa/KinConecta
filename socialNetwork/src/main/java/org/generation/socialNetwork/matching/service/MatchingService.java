package org.generation.socialNetwork.matching.service;

import org.generation.socialNetwork.matching.dto.MatchListResponseDTO;
import org.generation.socialNetwork.matching.dto.MatchResultDTO;
import org.generation.socialNetwork.matching.dto.ProfilePreviewDTO;
import org.generation.socialNetwork.matching.model.GuideAdaptationEntity;
import org.generation.socialNetwork.matching.model.GuideCertificationEntity;
import org.generation.socialNetwork.matching.model.GuideLocationEntity;
import org.generation.socialNetwork.matching.model.GuideProfileEntity;
import org.generation.socialNetwork.matching.model.InterestEntity;
import org.generation.socialNetwork.matching.model.LanguageEntity;
import org.generation.socialNetwork.matching.model.TouristProfileEntity;
import org.generation.socialNetwork.matching.repository.GuideProfileRepository;
import org.generation.socialNetwork.matching.repository.TouristProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class MatchingService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final TouristProfileRepository touristProfileRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final MatchingScoringEngine scoringEngine;

    public MatchingService(TouristProfileRepository touristProfileRepository,
                           GuideProfileRepository guideProfileRepository,
                           MatchingScoringEngine scoringEngine) {
        this.touristProfileRepository = touristProfileRepository;
        this.guideProfileRepository = guideProfileRepository;
        this.scoringEngine = scoringEngine;
    }

    public MatchListResponseDTO getRecommendedGuidesForTourist(Long touristUserId, Integer limit, Integer offset) {
        int safeLimit = sanitizeLimit(limit);
        int safeOffset = sanitizeOffset(offset);

        TouristProfileEntity baseTourist = touristProfileRepository.findDetailedByUserId(touristUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tourist profile not found for userId=" + touristUserId
                ));

        MatchingProfiles.TouristMatchingData touristData = toTouristData(baseTourist);
        List<ScoredCandidate> sorted = guideProfileRepository.findAllActiveGuideCandidates().stream()
                .filter(candidate -> !candidate.getUserId().equals(touristUserId))
                .map(candidate -> toScoredGuideCandidate(touristData, candidate))
                .sorted(candidateComparator())
                .toList();

        return toResponse(sorted, safeLimit, safeOffset);
    }

    public MatchListResponseDTO getRecommendedTouristsForGuide(Long guideUserId, Integer limit, Integer offset) {
        int safeLimit = sanitizeLimit(limit);
        int safeOffset = sanitizeOffset(offset);

        GuideProfileEntity baseGuide = guideProfileRepository.findDetailedByUserId(guideUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Guide profile not found for userId=" + guideUserId
                ));

        MatchingProfiles.GuideMatchingData guideData = toGuideData(baseGuide);
        List<ScoredCandidate> sorted = touristProfileRepository.findAllActiveTouristCandidates().stream()
                .filter(candidate -> !candidate.getUserId().equals(guideUserId))
                .map(candidate -> toScoredTouristCandidate(guideData, candidate))
                .sorted(candidateComparator())
                .toList();

        return toResponse(sorted, safeLimit, safeOffset);
    }

    private ScoredCandidate toScoredGuideCandidate(MatchingProfiles.TouristMatchingData touristData, GuideProfileEntity guideEntity) {
        MatchingProfiles.GuideMatchingData guideData = toGuideData(guideEntity);
        MatchingScoringEngine.ScoringResult score = scoringEngine.score(touristData, guideData);
        MatchResultDTO result = new MatchResultDTO(
                guideData.userId(),
                score.score(),
                score.matchedFields(),
                new ProfilePreviewDTO(
                        guideData.fullName(),
                        guideData.avatarUrl(),
                        guideData.coverUrl(),
                        guideData.locationLabel(),
                        guideData.ratingAvg(),
                        guideData.reviewsCount()
                )
        );
        return new ScoredCandidate(result, score.matchedFieldsCount());
    }

    private ScoredCandidate toScoredTouristCandidate(MatchingProfiles.GuideMatchingData guideData, TouristProfileEntity touristEntity) {
        MatchingProfiles.TouristMatchingData touristData = toTouristData(touristEntity);
        MatchingScoringEngine.ScoringResult score = scoringEngine.score(touristData, guideData);
        MatchResultDTO result = new MatchResultDTO(
                touristData.userId(),
                score.score(),
                score.matchedFields(),
                new ProfilePreviewDTO(
                        touristData.fullName(),
                        touristData.avatarUrl(),
                        touristData.coverUrl(),
                        touristData.location(),
                        null,
                        null
                )
        );
        return new ScoredCandidate(result, score.matchedFieldsCount());
    }

    private Comparator<ScoredCandidate> candidateComparator() {
        return Comparator
                .comparingDouble((ScoredCandidate candidate) -> candidate.result().score()).reversed()
                .thenComparing(Comparator.comparingInt(ScoredCandidate::matchedFieldsCount).reversed())
                .thenComparing(candidate -> candidate.result().candidateUserId());
    }

    private MatchListResponseDTO toResponse(List<ScoredCandidate> sorted, int limit, int offset) {
        int fromIndex = Math.min(offset, sorted.size());
        int toIndex = Math.min(fromIndex + limit, sorted.size());

        List<MatchResultDTO> paginated = sorted.subList(fromIndex, toIndex).stream()
                .map(ScoredCandidate::result)
                .toList();

        return new MatchListResponseDTO(paginated, sorted.size(), limit, offset);
    }

    private int sanitizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private int sanitizeOffset(Integer offset) {
        if (offset == null || offset < 0) {
            return 0;
        }
        return offset;
    }

    private MatchingProfiles.TouristMatchingData toTouristData(TouristProfileEntity entity) {
        return new MatchingProfiles.TouristMatchingData(
                entity.getUserId(),
                entity.getUser().getFullName(),
                entity.getAvatarUrl(),
                entity.getCoverUrl(),
                entity.getLocation(),
                toLanguageNames(entity.getLanguages()),
                toInterestNames(entity.getInterests()),
                entity.getTravelStyle(),
                entity.getTripType(),
                entity.getPaceAndCompany(),
                entity.getActivityLevel(),
                entity.getGroupPreference(),
                entity.getDietaryPreferences(),
                entity.getPlanningLevel(),
                entity.getAmenities(),
                entity.getTransport(),
                entity.getPhotoPreference(),
                entity.getAccessibility(),
                entity.getAdditionalNotes()
        );
    }

    private MatchingProfiles.GuideMatchingData toGuideData(GuideProfileEntity entity) {
        return new MatchingProfiles.GuideMatchingData(
                entity.getUserId(),
                entity.getUser().getFullName(),
                entity.getAvatarUrl(),
                entity.getCoverUrl(),
                entity.getLocationLabel(),
                entity.getRatingAvg(),
                entity.getReviewsCount(),
                toLanguageNames(entity.getLanguages()),
                entity.getExpertiseAreas().stream().map(area -> area.getName()).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)),
                entity.getLocations().stream().map(GuideLocationEntity::getLocationName).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)),
                entity.getExperienceLevel(),
                entity.getStyle(),
                entity.getGroupSize(),
                entity.getTourIntensity(),
                entity.getTransportOffered(),
                entity.getCertifications().stream().map(GuideCertificationEntity::getName).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)),
                entity.getAdaptations().stream().map(GuideAdaptationEntity::getName).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)),
                entity.getPhotoStyle(),
                entity.getAdditionalNotes()
        );
    }

    private Set<String> toLanguageNames(Set<LanguageEntity> languages) {
        return languages.stream()
                .map(language -> language.getName() == null ? language.getLanguageCode() : language.getName())
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> toInterestNames(Set<InterestEntity> interests) {
        return interests.stream()
                .map(InterestEntity::getName)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private record ScoredCandidate(MatchResultDTO result, int matchedFieldsCount) {
    }
}

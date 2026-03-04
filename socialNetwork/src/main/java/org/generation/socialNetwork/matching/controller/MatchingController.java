package org.generation.socialNetwork.matching.controller;

import org.generation.socialNetwork.matching.dto.MatchListResponseDTO;
import org.generation.socialNetwork.matching.service.MatchingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/tourist/{touristUserId}/guides")
    public MatchListResponseDTO recommendedGuidesForTourist(
            @PathVariable Long touristUserId,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset
    ) {
        return matchingService.getRecommendedGuidesForTourist(touristUserId, limit, offset);
    }

    @GetMapping("/guide/{guideUserId}/tourists")
    public MatchListResponseDTO recommendedTouristsForGuide(
            @PathVariable Long guideUserId,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset
    ) {
        return matchingService.getRecommendedTouristsForGuide(guideUserId, limit, offset);
    }
}

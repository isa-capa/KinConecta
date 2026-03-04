package org.generation.socialNetwork.matching.dto;

import java.util.List;

public record MatchListResponseDTO(
        List<MatchResultDTO> results,
        long totalCandidates,
        int limit,
        int offset
) {
}

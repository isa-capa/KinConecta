package org.generation.socialNetwork.matching.dto;

import java.util.List;

public record MatchResultDTO(
        Long candidateUserId,
        double score,
        List<MatchedFieldDTO> matchedFields,
        ProfilePreviewDTO profilePreview
) {
}

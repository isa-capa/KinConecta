package org.generation.socialNetwork.matching.dto;

import java.math.BigDecimal;

public record ProfilePreviewDTO(
        String fullName,
        String avatarUrl,
        String coverUrl,
        String locationLabel,
        BigDecimal rating,
        Integer reviewsCount
) {
}

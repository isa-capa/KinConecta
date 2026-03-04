package org.generation.socialNetwork.matching.dto;

public record MatchedFieldDTO(
        String field,
        String evidence,
        double points
) {
}

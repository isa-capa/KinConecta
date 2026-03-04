package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideExpertiseArea;

public class GuideExpertiseAreaMapper {

    private GuideExpertiseAreaMapper() {
    }

    public static GuideExpertiseArea toEntity(GuideExpertiseAreaCreateRequestDTO dto) {
        GuideExpertiseArea entity = new GuideExpertiseArea();
        entity.setName(dto.getName());
        return entity;
    }

    public static void updateEntity(GuideExpertiseArea entity, GuideExpertiseAreaUpdateRequestDTO dto) {
        entity.setName(dto.getName());
    }

    public static GuideExpertiseAreaResponseDTO toResponseDTO(GuideExpertiseArea entity) {
        GuideExpertiseAreaResponseDTO dto = new GuideExpertiseAreaResponseDTO();
        dto.setExpertiseId(entity.getExpertiseId());
        dto.setName(entity.getName());
        return dto;
    }
}
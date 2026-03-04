package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfileExpertise;

public class GuideProfileExpertiseMapper {

    private GuideProfileExpertiseMapper() {
    }

    public static GuideProfileExpertise toEntity(GuideProfileExpertiseCreateRequestDTO dto) {
        GuideProfileExpertise entity = new GuideProfileExpertise();
        entity.setUserId(dto.getUserId());
        entity.setExpertiseId(dto.getExpertiseId());
        return entity;
    }

    public static void updateEntity(GuideProfileExpertise entity, GuideProfileExpertiseUpdateRequestDTO dto) {

    }

    public static GuideProfileExpertiseResponseDTO toResponseDTO(GuideProfileExpertise entity) {
        GuideProfileExpertiseResponseDTO dto = new GuideProfileExpertiseResponseDTO();
        dto.setUserId(entity.getUserId());
        dto.setExpertiseId(entity.getExpertiseId());
        return dto;
    }
}
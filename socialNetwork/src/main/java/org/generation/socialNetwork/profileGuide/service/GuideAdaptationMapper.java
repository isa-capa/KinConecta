package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideAdaptation;

public class GuideAdaptationMapper {

    private GuideAdaptationMapper() {
    }

    public static GuideAdaptation toEntity(GuideAdaptationCreateRequestDTO dto) {
        GuideAdaptation entity = new GuideAdaptation();
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
        return entity;
    }

    public static void updateEntity(GuideAdaptation entity, GuideAdaptationUpdateRequestDTO dto) {
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
    }

    public static GuideAdaptationResponseDTO toResponseDTO(GuideAdaptation entity) {
        GuideAdaptationResponseDTO dto = new GuideAdaptationResponseDTO();
        dto.setAdaptationId(entity.getAdaptationId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        return dto;
    }
}
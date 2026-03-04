package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideLocationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideLocation;

public class GuideLocationMapper {

    private GuideLocationMapper() {
    }

    public static GuideLocation toEntity(GuideLocationCreateRequestDTO dto) {
        GuideLocation entity = new GuideLocation();
        entity.setUserId(dto.getUserId());
        entity.setLocationName(dto.getLocationName());
        return entity;
    }

    public static void updateEntity(GuideLocation entity, GuideLocationUpdateRequestDTO dto) {
        entity.setUserId(dto.getUserId());
        entity.setLocationName(dto.getLocationName());
    }

    public static GuideLocationResponseDTO toResponseDTO(GuideLocation entity) {
        GuideLocationResponseDTO dto = new GuideLocationResponseDTO();
        dto.setGuideLocationId(entity.getGuideLocationId());
        dto.setUserId(entity.getUserId());
        dto.setLocationName(entity.getLocationName());
        return dto;
    }
}
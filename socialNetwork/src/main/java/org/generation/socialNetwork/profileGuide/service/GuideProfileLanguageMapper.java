package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfileLanguage;

public class GuideProfileLanguageMapper {

    private GuideProfileLanguageMapper() {
    }

    public static GuideProfileLanguage toEntity(GuideProfileLanguageCreateRequestDTO dto) {
        GuideProfileLanguage entity = new GuideProfileLanguage();
        entity.setUserId(dto.getUserId());
        entity.setLanguageCode(dto.getLanguageCode());
        return entity;
    }

    public static void updateEntity(GuideProfileLanguage entity, GuideProfileLanguageUpdateRequestDTO dto) {

    }

    public static GuideProfileLanguageResponseDTO toResponseDTO(GuideProfileLanguage entity) {
        GuideProfileLanguageResponseDTO dto = new GuideProfileLanguageResponseDTO();
        dto.setUserId(entity.getUserId());
        dto.setLanguageCode(entity.getLanguageCode());
        return dto;
    }
}
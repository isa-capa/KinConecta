package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideCertificationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideCertification;

public class GuideCertificationMapper {

    private GuideCertificationMapper() {
    }

    public static GuideCertification toEntity(GuideCertificationCreateRequestDTO dto) {
        GuideCertification entity = new GuideCertification();
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
        return entity;
    }

    public static void updateEntity(GuideCertification entity, GuideCertificationUpdateRequestDTO dto) {
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
    }

    public static GuideCertificationResponseDTO toResponseDTO(GuideCertification entity) {
        GuideCertificationResponseDTO dto = new GuideCertificationResponseDTO();
        dto.setCertificationId(entity.getCertificationId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        return dto;
    }
}
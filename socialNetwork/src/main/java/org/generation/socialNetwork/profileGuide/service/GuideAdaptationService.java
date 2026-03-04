package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationUpdateRequestDTO;

import java.util.List;

public interface GuideAdaptationService {

    GuideAdaptationResponseDTO create(GuideAdaptationCreateRequestDTO dto);

    GuideAdaptationResponseDTO update(Long id, GuideAdaptationUpdateRequestDTO dto);

    GuideAdaptationResponseDTO findById(Long id);

    List<GuideAdaptationResponseDTO> findAll();

    void delete(Long id);
}
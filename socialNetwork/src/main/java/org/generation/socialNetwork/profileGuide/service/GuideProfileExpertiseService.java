package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseUpdateRequestDTO;

import java.util.List;

public interface GuideProfileExpertiseService {

    GuideProfileExpertiseResponseDTO create(GuideProfileExpertiseCreateRequestDTO dto);

    GuideProfileExpertiseResponseDTO update(Long userId, Integer expertiseId, GuideProfileExpertiseUpdateRequestDTO dto);

    GuideProfileExpertiseResponseDTO findById(Long userId, Integer expertiseId);

    List<GuideProfileExpertiseResponseDTO> findAll();

    void delete(Long userId, Integer expertiseId);
}
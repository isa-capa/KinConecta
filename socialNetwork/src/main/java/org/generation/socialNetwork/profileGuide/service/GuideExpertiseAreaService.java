package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaUpdateRequestDTO;

import java.util.List;

public interface GuideExpertiseAreaService {

    GuideExpertiseAreaResponseDTO create(GuideExpertiseAreaCreateRequestDTO dto);

    GuideExpertiseAreaResponseDTO update(Integer id, GuideExpertiseAreaUpdateRequestDTO dto);

    GuideExpertiseAreaResponseDTO findById(Integer id);

    List<GuideExpertiseAreaResponseDTO> findAll();

    void delete(Integer id);
}
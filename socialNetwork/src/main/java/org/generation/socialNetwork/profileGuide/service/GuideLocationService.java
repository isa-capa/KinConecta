package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideLocationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationUpdateRequestDTO;

import java.util.List;

public interface GuideLocationService {

    GuideLocationResponseDTO create(GuideLocationCreateRequestDTO dto);

    GuideLocationResponseDTO update(Long id, GuideLocationUpdateRequestDTO dto);

    GuideLocationResponseDTO findById(Long id);

    List<GuideLocationResponseDTO> findAll();

    void delete(Long id);
}
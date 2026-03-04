package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileUpdateRequestDTO;

import java.util.List;

public interface GuideProfileService {

    GuideProfileResponseDTO create(GuideProfileCreateRequestDTO dto);

    GuideProfileResponseDTO update(Long id, GuideProfileUpdateRequestDTO dto);

    GuideProfileResponseDTO findById(Long id);

    List<GuideProfileResponseDTO> findAll();

    void delete(Long id);
}
package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideCertificationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationUpdateRequestDTO;

import java.util.List;

public interface GuideCertificationService {

    GuideCertificationResponseDTO create(GuideCertificationCreateRequestDTO dto);

    GuideCertificationResponseDTO update(Long id, GuideCertificationUpdateRequestDTO dto);

    GuideCertificationResponseDTO findById(Long id);

    List<GuideCertificationResponseDTO> findAll();

    void delete(Long id);
}
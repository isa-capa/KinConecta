package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCertificationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideCertification;
import org.generation.socialNetwork.profileGuide.repository.GuideCertificationRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideCertificationServiceImpl implements GuideCertificationService {

    private final GuideCertificationRepository guideCertificationRepository;
    private final GuideProfileRepository guideProfileRepository;

    @Override
    public GuideCertificationResponseDTO create(GuideCertificationCreateRequestDTO dto) {
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideCertification entity = GuideCertificationMapper.toEntity(dto);
        return GuideCertificationMapper.toResponseDTO(guideCertificationRepository.save(entity));
    }

    @Override
    public GuideCertificationResponseDTO update(Long id, GuideCertificationUpdateRequestDTO dto) {
        GuideCertification entity = guideCertificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideCertification not found with id: " + id));
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideCertificationMapper.updateEntity(entity, dto);
        return GuideCertificationMapper.toResponseDTO(guideCertificationRepository.save(entity));
    }

    @Override
    public GuideCertificationResponseDTO findById(Long id) {
        return guideCertificationRepository.findById(id)
                .map(GuideCertificationMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideCertification not found with id: " + id));
    }

    @Override
    public List<GuideCertificationResponseDTO> findAll() {
        return guideCertificationRepository.findAll().stream()
                .map(GuideCertificationMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!guideCertificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideCertification not found with id: " + id);
        }
        guideCertificationRepository.deleteById(id);
    }

    private void validateGuideProfileExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!guideProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfile not found for " + fieldName + ": " + id);
        }
    }
}
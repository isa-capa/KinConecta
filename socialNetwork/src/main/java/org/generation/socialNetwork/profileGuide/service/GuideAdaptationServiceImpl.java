package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideAdaptation;
import org.generation.socialNetwork.profileGuide.repository.GuideAdaptationRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideAdaptationServiceImpl implements GuideAdaptationService {

    private final GuideAdaptationRepository guideAdaptationRepository;
    private final GuideProfileRepository guideProfileRepository;

    @Override
    public GuideAdaptationResponseDTO create(GuideAdaptationCreateRequestDTO dto) {
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideAdaptation entity = GuideAdaptationMapper.toEntity(dto);
        return GuideAdaptationMapper.toResponseDTO(guideAdaptationRepository.save(entity));
    }

    @Override
    public GuideAdaptationResponseDTO update(Long id, GuideAdaptationUpdateRequestDTO dto) {
        GuideAdaptation entity = guideAdaptationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideAdaptation not found with id: " + id));
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideAdaptationMapper.updateEntity(entity, dto);
        return GuideAdaptationMapper.toResponseDTO(guideAdaptationRepository.save(entity));
    }

    @Override
    public GuideAdaptationResponseDTO findById(Long id) {
        return guideAdaptationRepository.findById(id)
                .map(GuideAdaptationMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideAdaptation not found with id: " + id));
    }

    @Override
    public List<GuideAdaptationResponseDTO> findAll() {
        return guideAdaptationRepository.findAll().stream()
                .map(GuideAdaptationMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!guideAdaptationRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideAdaptation not found with id: " + id);
        }
        guideAdaptationRepository.deleteById(id);
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
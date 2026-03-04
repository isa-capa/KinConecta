package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideLocation;
import org.generation.socialNetwork.profileGuide.repository.GuideLocationRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideLocationServiceImpl implements GuideLocationService {

    private final GuideLocationRepository guideLocationRepository;
    private final GuideProfileRepository guideProfileRepository;

    @Override
    public GuideLocationResponseDTO create(GuideLocationCreateRequestDTO dto) {
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideLocation entity = GuideLocationMapper.toEntity(dto);
        return GuideLocationMapper.toResponseDTO(guideLocationRepository.save(entity));
    }

    @Override
    public GuideLocationResponseDTO update(Long id, GuideLocationUpdateRequestDTO dto) {
        GuideLocation entity = guideLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideLocation not found with id: " + id));
        validateGuideProfileExists(dto.getUserId(), "userId");
        GuideLocationMapper.updateEntity(entity, dto);
        return GuideLocationMapper.toResponseDTO(guideLocationRepository.save(entity));
    }

    @Override
    public GuideLocationResponseDTO findById(Long id) {
        return guideLocationRepository.findById(id)
                .map(GuideLocationMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideLocation not found with id: " + id));
    }

    @Override
    public List<GuideLocationResponseDTO> findAll() {
        return guideLocationRepository.findAll().stream()
                .map(GuideLocationMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!guideLocationRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideLocation not found with id: " + id);
        }
        guideLocationRepository.deleteById(id);
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
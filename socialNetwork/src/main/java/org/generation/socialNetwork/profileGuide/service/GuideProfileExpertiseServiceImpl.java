package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfileExpertise;
import org.generation.socialNetwork.profileGuide.model.GuideProfileExpertiseId;
import org.generation.socialNetwork.profileGuide.repository.GuideExpertiseAreaRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileExpertiseRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideProfileExpertiseServiceImpl implements GuideProfileExpertiseService {

    private final GuideProfileExpertiseRepository guideProfileExpertiseRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final GuideExpertiseAreaRepository guideExpertiseAreaRepository;

    @Override
    public GuideProfileExpertiseResponseDTO create(GuideProfileExpertiseCreateRequestDTO dto) {
        validateGuideProfileExists(dto.getUserId(), "userId");
        validateGuideExpertiseAreaExists(dto.getExpertiseId(), "expertiseId");
        GuideProfileExpertise entity = GuideProfileExpertiseMapper.toEntity(dto);
        return GuideProfileExpertiseMapper.toResponseDTO(guideProfileExpertiseRepository.save(entity));
    }

    @Override
    public GuideProfileExpertiseResponseDTO update(Long userId, Integer expertiseId, GuideProfileExpertiseUpdateRequestDTO dto) {
        GuideProfileExpertiseId id = new GuideProfileExpertiseId(userId, expertiseId);
        GuideProfileExpertise entity = guideProfileExpertiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfileExpertise not found with id: " + id));

        GuideProfileExpertiseMapper.updateEntity(entity, dto);
        return GuideProfileExpertiseMapper.toResponseDTO(guideProfileExpertiseRepository.save(entity));
    }

    @Override
    public GuideProfileExpertiseResponseDTO findById(Long userId, Integer expertiseId) {
        GuideProfileExpertiseId id = new GuideProfileExpertiseId(userId, expertiseId);
        return guideProfileExpertiseRepository.findById(id)
                .map(GuideProfileExpertiseMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfileExpertise not found with id: " + id));
    }

    @Override
    public List<GuideProfileExpertiseResponseDTO> findAll() {
        return guideProfileExpertiseRepository.findAll().stream()
                .map(GuideProfileExpertiseMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long userId, Integer expertiseId) {
        GuideProfileExpertiseId id = new GuideProfileExpertiseId(userId, expertiseId);
        if (!guideProfileExpertiseRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfileExpertise not found with id: " + id);
        }
        guideProfileExpertiseRepository.deleteById(id);
    }

    private void validateGuideProfileExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!guideProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfile not found for " + fieldName + ": " + id);
        }
    }
    private void validateGuideExpertiseAreaExists(Integer id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!guideExpertiseAreaRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideExpertiseArea not found for " + fieldName + ": " + id);
        }
    }
}
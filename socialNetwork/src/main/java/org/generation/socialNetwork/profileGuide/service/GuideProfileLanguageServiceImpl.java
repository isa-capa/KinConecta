package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfileLanguage;
import org.generation.socialNetwork.profileGuide.model.GuideProfileLanguageId;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileLanguageRepository;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.generation.socialNetwork.users.repository.LanguageRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideProfileLanguageServiceImpl implements GuideProfileLanguageService {

    private final GuideProfileLanguageRepository guideProfileLanguageRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final LanguageRepository languageRepository;

    @Override
    public GuideProfileLanguageResponseDTO create(GuideProfileLanguageCreateRequestDTO dto) {
        validateGuideProfileExists(dto.getUserId(), "userId");
        validateLanguageExists(dto.getLanguageCode(), "languageCode");
        GuideProfileLanguage entity = GuideProfileLanguageMapper.toEntity(dto);
        return GuideProfileLanguageMapper.toResponseDTO(guideProfileLanguageRepository.save(entity));
    }

    @Override
    public GuideProfileLanguageResponseDTO update(Long userId, String languageCode, GuideProfileLanguageUpdateRequestDTO dto) {
        GuideProfileLanguageId id = new GuideProfileLanguageId(userId, languageCode);
        GuideProfileLanguage entity = guideProfileLanguageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfileLanguage not found with id: " + id));

        GuideProfileLanguageMapper.updateEntity(entity, dto);
        return GuideProfileLanguageMapper.toResponseDTO(guideProfileLanguageRepository.save(entity));
    }

    @Override
    public GuideProfileLanguageResponseDTO findById(Long userId, String languageCode) {
        GuideProfileLanguageId id = new GuideProfileLanguageId(userId, languageCode);
        return guideProfileLanguageRepository.findById(id)
                .map(GuideProfileLanguageMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfileLanguage not found with id: " + id));
    }

    @Override
    public List<GuideProfileLanguageResponseDTO> findAll() {
        return guideProfileLanguageRepository.findAll().stream()
                .map(GuideProfileLanguageMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long userId, String languageCode) {
        GuideProfileLanguageId id = new GuideProfileLanguageId(userId, languageCode);
        if (!guideProfileLanguageRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfileLanguage not found with id: " + id);
        }
        guideProfileLanguageRepository.deleteById(id);
    }

    private void validateGuideProfileExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!guideProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfile not found for " + fieldName + ": " + id);
        }
    }
    private void validateLanguageExists(String id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!languageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Language not found for " + fieldName + ": " + id);
        }
    }
}
package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfile;
import org.generation.socialNetwork.profileGuide.repository.GuideProfileRepository;
import org.generation.socialNetwork.users.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideProfileServiceImpl implements GuideProfileService {

    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;

    @Override
    public GuideProfileResponseDTO create(GuideProfileCreateRequestDTO dto) {
        validateUserExists(dto.getUserId(), "userId");
        GuideProfile entity = GuideProfileMapper.toEntity(dto);
        return GuideProfileMapper.toResponseDTO(guideProfileRepository.save(entity));
    }

    @Override
    public GuideProfileResponseDTO update(Long id, GuideProfileUpdateRequestDTO dto) {
        GuideProfile entity = guideProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfile not found with id: " + id));

        GuideProfileMapper.updateEntity(entity, dto);
        return GuideProfileMapper.toResponseDTO(guideProfileRepository.save(entity));
    }

    @Override
    public GuideProfileResponseDTO findById(Long id) {
        return guideProfileRepository.findById(id)
                .map(GuideProfileMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideProfile not found with id: " + id));
    }

    @Override
    public List<GuideProfileResponseDTO> findAll() {
        return guideProfileRepository.findAll().stream()
                .map(GuideProfileMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!guideProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideProfile not found with id: " + id);
        }
        guideProfileRepository.deleteById(id);
    }

    private void validateUserExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found for " + fieldName + ": " + id);
        }
    }
}
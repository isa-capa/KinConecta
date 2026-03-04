package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideExpertiseArea;
import org.generation.socialNetwork.profileGuide.repository.GuideExpertiseAreaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideExpertiseAreaServiceImpl implements GuideExpertiseAreaService {

    private final GuideExpertiseAreaRepository guideExpertiseAreaRepository;

    @Override
    public GuideExpertiseAreaResponseDTO create(GuideExpertiseAreaCreateRequestDTO dto) {

        GuideExpertiseArea entity = GuideExpertiseAreaMapper.toEntity(dto);
        return GuideExpertiseAreaMapper.toResponseDTO(guideExpertiseAreaRepository.save(entity));
    }

    @Override
    public GuideExpertiseAreaResponseDTO update(Integer id, GuideExpertiseAreaUpdateRequestDTO dto) {
        GuideExpertiseArea entity = guideExpertiseAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideExpertiseArea not found with id: " + id));

        GuideExpertiseAreaMapper.updateEntity(entity, dto);
        return GuideExpertiseAreaMapper.toResponseDTO(guideExpertiseAreaRepository.save(entity));
    }

    @Override
    public GuideExpertiseAreaResponseDTO findById(Integer id) {
        return guideExpertiseAreaRepository.findById(id)
                .map(GuideExpertiseAreaMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideExpertiseArea not found with id: " + id));
    }

    @Override
    public List<GuideExpertiseAreaResponseDTO> findAll() {
        return guideExpertiseAreaRepository.findAll().stream()
                .map(GuideExpertiseAreaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Integer id) {
        if (!guideExpertiseAreaRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideExpertiseArea not found with id: " + id);
        }
        guideExpertiseAreaRepository.deleteById(id);
    }


}
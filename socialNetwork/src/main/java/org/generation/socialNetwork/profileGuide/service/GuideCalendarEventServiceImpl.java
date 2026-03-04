package org.generation.socialNetwork.profileGuide.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideCalendarEvent;
import org.generation.socialNetwork.profileGuide.repository.GuideCalendarEventRepository;
import org.generation.socialNetwork.tours.repository.TripBookingRepository;
import org.generation.socialNetwork.users.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuideCalendarEventServiceImpl implements GuideCalendarEventService {

    private final GuideCalendarEventRepository guideCalendarEventRepository;
    private final UserRepository userRepository;
    private final TripBookingRepository tripBookingRepository;

    @Override
    public GuideCalendarEventResponseDTO create(GuideCalendarEventCreateRequestDTO dto) {
        validateUserExists(dto.getGuideId(), "guideId");
        validateTripBookingExists(dto.getTripId(), "tripId");
        GuideCalendarEvent entity = GuideCalendarEventMapper.toEntity(dto);
        return GuideCalendarEventMapper.toResponseDTO(guideCalendarEventRepository.save(entity));
    }

    @Override
    public GuideCalendarEventResponseDTO update(Long id, GuideCalendarEventUpdateRequestDTO dto) {
        GuideCalendarEvent entity = guideCalendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GuideCalendarEvent not found with id: " + id));
        validateUserExists(dto.getGuideId(), "guideId");
        validateTripBookingExists(dto.getTripId(), "tripId");
        GuideCalendarEventMapper.updateEntity(entity, dto);
        return GuideCalendarEventMapper.toResponseDTO(guideCalendarEventRepository.save(entity));
    }

    @Override
    public GuideCalendarEventResponseDTO findById(Long id) {
        return guideCalendarEventRepository.findById(id)
                .map(GuideCalendarEventMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("GuideCalendarEvent not found with id: " + id));
    }

    @Override
    public List<GuideCalendarEventResponseDTO> findAll() {
        return guideCalendarEventRepository.findAll().stream()
                .map(GuideCalendarEventMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!guideCalendarEventRepository.existsById(id)) {
            throw new ResourceNotFoundException("GuideCalendarEvent not found with id: " + id);
        }
        guideCalendarEventRepository.deleteById(id);
    }

    private void validateUserExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found for " + fieldName + ": " + id);
        }
    }
    private void validateTripBookingExists(Long id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!tripBookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("TripBooking not found for " + fieldName + ": " + id);
        }
    }
}
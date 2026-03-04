package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventUpdateRequestDTO;

import java.util.List;

public interface GuideCalendarEventService {

    GuideCalendarEventResponseDTO create(GuideCalendarEventCreateRequestDTO dto);

    GuideCalendarEventResponseDTO update(Long id, GuideCalendarEventUpdateRequestDTO dto);

    GuideCalendarEventResponseDTO findById(Long id);

    List<GuideCalendarEventResponseDTO> findAll();

    void delete(Long id);
}
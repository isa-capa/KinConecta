package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideCalendarEvent;

public class GuideCalendarEventMapper {

    private GuideCalendarEventMapper() {
    }

    public static GuideCalendarEvent toEntity(GuideCalendarEventCreateRequestDTO dto) {
        GuideCalendarEvent entity = new GuideCalendarEvent();
        entity.setGuideId(dto.getGuideId());
        entity.setTripId(dto.getTripId());
        entity.setEventType(dto.getEventType());
        entity.setTitle(dto.getTitle());
        entity.setStartDatetime(dto.getStartDatetime());
        entity.setEndDatetime(dto.getEndDatetime());
        entity.setOrganizerName(dto.getOrganizerName());
        entity.setSource(dto.getSource());
        entity.setStatus(dto.getStatus());
        entity.setCreatedAt(dto.getCreatedAt());
        return entity;
    }

    public static void updateEntity(GuideCalendarEvent entity, GuideCalendarEventUpdateRequestDTO dto) {
        entity.setGuideId(dto.getGuideId());
        entity.setTripId(dto.getTripId());
        entity.setEventType(dto.getEventType());
        entity.setTitle(dto.getTitle());
        entity.setStartDatetime(dto.getStartDatetime());
        entity.setEndDatetime(dto.getEndDatetime());
        entity.setOrganizerName(dto.getOrganizerName());
        entity.setSource(dto.getSource());
        entity.setStatus(dto.getStatus());
        entity.setCreatedAt(dto.getCreatedAt());
    }

    public static GuideCalendarEventResponseDTO toResponseDTO(GuideCalendarEvent entity) {
        GuideCalendarEventResponseDTO dto = new GuideCalendarEventResponseDTO();
        dto.setEventId(entity.getEventId());
        dto.setGuideId(entity.getGuideId());
        dto.setTripId(entity.getTripId());
        dto.setEventType(entity.getEventType());
        dto.setTitle(entity.getTitle());
        dto.setStartDatetime(entity.getStartDatetime());
        dto.setEndDatetime(entity.getEndDatetime());
        dto.setOrganizerName(entity.getOrganizerName());
        dto.setSource(entity.getSource());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
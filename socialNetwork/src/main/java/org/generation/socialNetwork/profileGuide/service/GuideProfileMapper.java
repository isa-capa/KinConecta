package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.model.GuideProfile;

public class GuideProfileMapper {

    private GuideProfileMapper() {
    }

    public static GuideProfile toEntity(GuideProfileCreateRequestDTO dto) {
        GuideProfile entity = new GuideProfile();
        entity.setUserId(dto.getUserId());
        entity.setSummary(dto.getSummary());
        entity.setStory(dto.getStory());
        entity.setStatusText(dto.getStatusText());
        entity.setHourlyRate(dto.getHourlyRate());
        entity.setCurrency(dto.getCurrency());
        entity.setRatingAvg(dto.getRatingAvg());
        entity.setReviewsCount(dto.getReviewsCount());
        entity.setLocationLabel(dto.getLocationLabel());
        entity.setExperienceLevel(dto.getExperienceLevel());
        entity.setStyle(dto.getStyle());
        entity.setGroupSize(dto.getGroupSize());
        entity.setTourIntensity(dto.getTourIntensity());
        entity.setTransportOffered(dto.getTransportOffered());
        entity.setPhotoStyle(dto.getPhotoStyle());
        entity.setAdditionalNotes(dto.getAdditionalNotes());
        entity.setAvatarUrl(dto.getAvatarUrl());
        entity.setCoverUrl(dto.getCoverUrl());
        entity.setPostText(dto.getPostText());
        entity.setPostImageUrl(dto.getPostImageUrl());
        entity.setPostCaption(dto.getPostCaption());
        entity.setPostPublishedAt(dto.getPostPublishedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        return entity;
    }

    public static void updateEntity(GuideProfile entity, GuideProfileUpdateRequestDTO dto) {
        entity.setSummary(dto.getSummary());
        entity.setStory(dto.getStory());
        entity.setStatusText(dto.getStatusText());
        entity.setHourlyRate(dto.getHourlyRate());
        entity.setCurrency(dto.getCurrency());
        entity.setRatingAvg(dto.getRatingAvg());
        entity.setReviewsCount(dto.getReviewsCount());
        entity.setLocationLabel(dto.getLocationLabel());
        entity.setExperienceLevel(dto.getExperienceLevel());
        entity.setStyle(dto.getStyle());
        entity.setGroupSize(dto.getGroupSize());
        entity.setTourIntensity(dto.getTourIntensity());
        entity.setTransportOffered(dto.getTransportOffered());
        entity.setPhotoStyle(dto.getPhotoStyle());
        entity.setAdditionalNotes(dto.getAdditionalNotes());
        entity.setAvatarUrl(dto.getAvatarUrl());
        entity.setCoverUrl(dto.getCoverUrl());
        entity.setPostText(dto.getPostText());
        entity.setPostImageUrl(dto.getPostImageUrl());
        entity.setPostCaption(dto.getPostCaption());
        entity.setPostPublishedAt(dto.getPostPublishedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
    }

    public static GuideProfileResponseDTO toResponseDTO(GuideProfile entity) {
        GuideProfileResponseDTO dto = new GuideProfileResponseDTO();
        dto.setUserId(entity.getUserId());
        dto.setSummary(entity.getSummary());
        dto.setStory(entity.getStory());
        dto.setStatusText(entity.getStatusText());
        dto.setHourlyRate(entity.getHourlyRate());
        dto.setCurrency(entity.getCurrency());
        dto.setRatingAvg(entity.getRatingAvg());
        dto.setReviewsCount(entity.getReviewsCount());
        dto.setLocationLabel(entity.getLocationLabel());
        dto.setExperienceLevel(entity.getExperienceLevel());
        dto.setStyle(entity.getStyle());
        dto.setGroupSize(entity.getGroupSize());
        dto.setTourIntensity(entity.getTourIntensity());
        dto.setTransportOffered(entity.getTransportOffered());
        dto.setPhotoStyle(entity.getPhotoStyle());
        dto.setAdditionalNotes(entity.getAdditionalNotes());
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setCoverUrl(entity.getCoverUrl());
        dto.setPostText(entity.getPostText());
        dto.setPostImageUrl(entity.getPostImageUrl());
        dto.setPostCaption(entity.getPostCaption());
        dto.setPostPublishedAt(entity.getPostPublishedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
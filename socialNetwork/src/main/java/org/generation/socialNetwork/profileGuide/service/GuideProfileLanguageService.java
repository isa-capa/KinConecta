package org.generation.socialNetwork.profileGuide.service;

import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageUpdateRequestDTO;

import java.util.List;

public interface GuideProfileLanguageService {

    GuideProfileLanguageResponseDTO create(GuideProfileLanguageCreateRequestDTO dto);

    GuideProfileLanguageResponseDTO update(Long userId, String languageCode, GuideProfileLanguageUpdateRequestDTO dto);

    GuideProfileLanguageResponseDTO findById(Long userId, String languageCode);

    List<GuideProfileLanguageResponseDTO> findAll();

    void delete(Long userId, String languageCode);
}
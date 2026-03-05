package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileLanguageUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideProfileLanguageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_profile_languages")
@RequiredArgsConstructor
public class GuideProfileLanguageController {

    private final GuideProfileLanguageService service;

    // Endpoint para crear una relación entre un guía y un idioma
    // URL: POST /api/guide_profile_languages
    @PostMapping
    public ResponseEntity<GuideProfileLanguageResponseDTO> create(@RequestBody GuideProfileLanguageCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todas las relaciones entre guías e idiomas
    // URL: GET /api/guide_profile_languages
    @GetMapping
    public ResponseEntity<List<GuideProfileLanguageResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener un idioma específico de un guía
    // URL: GET /api/guide_profile_languages/{userId}/{languageCode}
    @GetMapping("/{userId}/{languageCode}")
    public ResponseEntity<GuideProfileLanguageResponseDTO> findById(@PathVariable Long userId, @PathVariable String languageCode) {
        return ResponseEntity.ok(service.findById(userId, languageCode));
    }

    // Endpoint para actualizar la relación entre guía e idioma
    // URL: PUT /api/guide_profile_languages/{userId}/{languageCode}
    @PutMapping("/{userId}/{languageCode}")
    public ResponseEntity<GuideProfileLanguageResponseDTO> update(@PathVariable Long userId, @PathVariable String languageCode, @RequestBody GuideProfileLanguageUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(userId, languageCode, dto));
    }

    // Endpoint para eliminar un idioma del perfil del guía
    // URL: DELETE /api/guide_profile_languages/{userId}/{languageCode}
    @DeleteMapping("/{userId}/{languageCode}")
    public ResponseEntity<Void> delete(@PathVariable Long userId, @PathVariable String languageCode) {
        service.delete(userId, languageCode);
        return ResponseEntity.noContent().build();
    }
}
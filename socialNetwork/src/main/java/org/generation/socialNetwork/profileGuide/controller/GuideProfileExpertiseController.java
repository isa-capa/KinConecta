package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileExpertiseUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideProfileExpertiseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_profile_expertise")
@RequiredArgsConstructor
public class GuideProfileExpertiseController {

    private final GuideProfileExpertiseService service;

    // Endpoint para asignar un área de experiencia a un guía
    // URL: POST /api/guide_profile_expertise
    @PostMapping
    public ResponseEntity<GuideProfileExpertiseResponseDTO> create(@RequestBody GuideProfileExpertiseCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todas las relaciones entre perfiles y áreas de experiencia
    // URL: GET /api/guide_profile_expertise
    @GetMapping
    public ResponseEntity<List<GuideProfileExpertiseResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener una relación específica entre un guía y un área de experiencia
    // URL: GET /api/guide_profile_expertise/{userId}/{expertiseId}
    @GetMapping("/{userId}/{expertiseId}")
    public ResponseEntity<GuideProfileExpertiseResponseDTO> findById(@PathVariable Long userId, @PathVariable Integer expertiseId) {
        return ResponseEntity.ok(service.findById(userId, expertiseId));
    }

    // Endpoint para actualizar información de la relación
    // URL: PUT /api/guide_profile_expertise/{userId}/{expertiseId}
    @PutMapping("/{userId}/{expertiseId}")
    public ResponseEntity<GuideProfileExpertiseResponseDTO> update(@PathVariable Long userId, @PathVariable Integer expertiseId, @RequestBody GuideProfileExpertiseUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(userId, expertiseId, dto));
    }

    // Endpoint para eliminar la relación entre un guía y un área de experiencia
    // URL: DELETE /api/guide_profile_expertise/{userId}/{expertiseId}
    @DeleteMapping("/{userId}/{expertiseId}")
    public ResponseEntity<Void> delete(@PathVariable Long userId, @PathVariable Integer expertiseId) {
        service.delete(userId, expertiseId);
        return ResponseEntity.noContent().build();
    }
}
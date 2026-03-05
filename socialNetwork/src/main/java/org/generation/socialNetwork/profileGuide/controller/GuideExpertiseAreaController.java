package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideExpertiseAreaUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideExpertiseAreaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_expertise_areas")
@RequiredArgsConstructor
public class GuideExpertiseAreaController {

    private final GuideExpertiseAreaService service;

    // Endpoint para registrar una nueva área de experiencia
    // URL: POST /api/guide_expertise_areas
    @PostMapping
    public ResponseEntity<GuideExpertiseAreaResponseDTO> create(@RequestBody GuideExpertiseAreaCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todas las áreas de experiencia registradas
    // URL: GET /api/guide_expertise_areas
    @GetMapping
    public ResponseEntity<List<GuideExpertiseAreaResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener un registro específico
    // URL: GET /api/guide_expertise_areas/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GuideExpertiseAreaResponseDTO> findById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Endpoint para actualizar un registro existente
    // URL: PUT /api/guide_expertise_areas/{id}
    @PutMapping("/{id}")
    public ResponseEntity<GuideExpertiseAreaResponseDTO> update(@PathVariable("id") Integer id, @RequestBody GuideExpertiseAreaUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Endpoint para eliminar un registro
    // URL: DELETE /api/guide_expertise_areas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
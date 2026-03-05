package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideAdaptationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideAdaptationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_adaptations")
@RequiredArgsConstructor
public class GuideAdaptationController {

    private final GuideAdaptationService service;

    // Endpoint para crear una nueva adaptación del guía
    // URL: POST /api/guide_adaptations
    @PostMapping
    public ResponseEntity<GuideAdaptationResponseDTO> create(@RequestBody GuideAdaptationCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Se llama al service para crear el registro
    // Se responde con HTTP 201 (CREATED)
    @GetMapping
    public ResponseEntity<List<GuideAdaptationResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener todos los registros
    // URL: GET /api/guide_adaptations
    @GetMapping("/{id}")
    public ResponseEntity<GuideAdaptationResponseDTO> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Endpoint para obtener un registro específico por su ID
    // URL: GET /api/guide_adaptations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<GuideAdaptationResponseDTO> update(@PathVariable("id") Long id, @RequestBody GuideAdaptationUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Endpoint para eliminar un registro por ID
    // URL: DELETE /api/guide_adaptations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
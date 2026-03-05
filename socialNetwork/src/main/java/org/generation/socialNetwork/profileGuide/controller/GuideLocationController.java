package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideLocationUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideLocationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_locations")
@RequiredArgsConstructor
public class GuideLocationController {

    private final GuideLocationService service;

    // Endpoint para crear una nueva ubicación
    // URL: POST /api/guide_locations
    @PostMapping
    public ResponseEntity<GuideLocationResponseDTO> create(@RequestBody GuideLocationCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todas las ubicaciones registradas
    // URL: GET /api/guide_locations
    @GetMapping
    public ResponseEntity<List<GuideLocationResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener una ubicación específica
    // URL: GET /api/guide_locations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GuideLocationResponseDTO> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Endpoint para actualizar una ubicación
    // URL: PUT /api/guide_locations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<GuideLocationResponseDTO> update(@PathVariable("id") Long id, @RequestBody GuideLocationUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Endpoint para eliminar una ubicación
    // URL: DELETE /api/guide_locations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
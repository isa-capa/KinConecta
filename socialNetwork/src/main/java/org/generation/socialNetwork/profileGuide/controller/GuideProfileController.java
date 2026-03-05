package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideProfileUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_profiles")
@RequiredArgsConstructor
public class GuideProfileController {

    private final GuideProfileService service;

    // Endpoint para crear un nuevo perfil de guía
    // URL: POST /api/guide_profiles
    @PostMapping
    public ResponseEntity<GuideProfileResponseDTO> create(@RequestBody GuideProfileCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todos los perfiles de guías registrados
    // URL: GET /api/guide_profiles
    @GetMapping
    public ResponseEntity<List<GuideProfileResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener un perfil de guía específico
    // URL: GET /api/guide_profiles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GuideProfileResponseDTO> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Endpoint para actualizar un perfil existente
    // URL: PUT /api/guide_profiles/{id}
    @PutMapping("/{id}")
    public ResponseEntity<GuideProfileResponseDTO> update(@PathVariable("id") Long id, @RequestBody GuideProfileUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Endpoint para eliminar un perfil
    // URL: DELETE /api/guide_profiles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
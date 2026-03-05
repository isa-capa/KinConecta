package org.generation.socialNetwork.profileGuide.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventCreateRequestDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventResponseDTO;
import org.generation.socialNetwork.profileGuide.dto.GuideCalendarEventUpdateRequestDTO;
import org.generation.socialNetwork.profileGuide.service.GuideCalendarEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide_calendar_events")
@RequiredArgsConstructor
public class GuideCalendarEventController {

    private final GuideCalendarEventService service;

    // Endpoint para crear un nuevo evento
    // URL: POST /api/guide_calendar_events
    @PostMapping
    public ResponseEntity<GuideCalendarEventResponseDTO> create(@RequestBody GuideCalendarEventCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // Endpoint para obtener todos los eventos del calendario
    // URL: GET /api/guide_calendar_events
    @GetMapping
    public ResponseEntity<List<GuideCalendarEventResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Endpoint para obtener un evento específico
    // URL: GET /api/guide_calendar_events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GuideCalendarEventResponseDTO> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Endpoint para actualizar un evento del calendario
    // URL: PUT /api/guide_calendar_events/{id}
    @PutMapping("/{id}")
    public ResponseEntity<GuideCalendarEventResponseDTO> update(@PathVariable("id") Long id, @RequestBody GuideCalendarEventUpdateRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Endpoint para eliminar un evento del calendario
    // URL: DELETE /api/guide_calendar_events/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
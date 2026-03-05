package org.generation.socialNetwork.tours.service;

import org.generation.socialNetwork.tours.model.TripStatusHistory;
import org.generation.socialNetwork.tours.repository.TripStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripStatusHistoryService {

    private final TripStatusHistoryRepository tripStatusHistoryRepository;

    @Autowired
    public TripStatusHistoryService(TripStatusHistoryRepository tripStatusHistoryRepository) {
        this.tripStatusHistoryRepository = tripStatusHistoryRepository;
    }

    // Obtener todos los registros
    public List<TripStatusHistory> getAllHistory() {
        return tripStatusHistoryRepository.findAll();
    }

    // Obtener registro por ID
    public TripStatusHistory getHistoryById(Long id) {
        return tripStatusHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado con id: " + id));
    }

    // Obtener historial por trip
    public List<TripStatusHistory> getHistoryByTripId(Long tripId) {
        return tripStatusHistoryRepository.findByTripId(tripId);
    }

    // Agregar nuevo registro
    public TripStatusHistory addHistory(TripStatusHistory history) {
        return tripStatusHistoryRepository.save(history);
    }

    // Eliminar registro por ID
    public TripStatusHistory deleteHistoryById(Long id) {
        TripStatusHistory history = getHistoryById(id);
        tripStatusHistoryRepository.deleteById(id);
        return history;
    }
}

package org.generation.socialNetwork.tours.service;

import org.generation.socialNetwork.tours.model.TripBookings;
import org.generation.socialNetwork.tours.repository.TripBookingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripBookingsService {

    // Inyección de dependencias por constructor
    private final TripBookingsRepository tripBookingsRepository;

    @Autowired
    public TripBookingsService(TripBookingsRepository tripBookingsRepository) {
        this.tripBookingsRepository = tripBookingsRepository;
    }

    // Obtener todas las reservaciones de tours
    public List<TripBookings> getAllTripBookings() {
        return tripBookingsRepository.findAll();
    }

    // Obtener reservacion de tour por ID
    public TripBookings getTripBookingsById(Long tripId) {
        return tripBookingsRepository.findById(tripId).orElseThrow(
                () -> new RuntimeException("Reservación no encontrada con id: " + tripId)
        );
    }

    // Agregar nueva reservación de tour
    public TripBookings addTripBookings(TripBookings tripBookings) {
        return tripBookingsRepository.save(tripBookings);
    }

    // Eliminar reservación por ID
    public TripBookings deleteTripBookingsById(Long tripId) {
        TripBookings tripBookings = getTripBookingsById(tripId);
        tripBookingsRepository.deleteById(tripId);
        return tripBookings;
    }

    // Actualizar reservación por ID
    public TripBookings updateTripBookingsById(Long tripId, TripBookings updatedTripBookings) {
        TripBookings existing = getTripBookingsById(tripId);

        existing.setStartDatetime(updatedTripBookings.getStartDatetime());
        existing.setEndDatetime(updatedTripBookings.getEndDatetime());
        existing.setStatus(updatedTripBookings.getStatus()); //Viene del front end
        existing.setCancelReason(updatedTripBookings.getCancelReason());
        existing.setNotes(updatedTripBookings.getNotes());
        existing.setCreatedAt(updatedTripBookings.getCreatedAt());
        existing.setUpdatedAt(updatedTripBookings.getUpdatedAt());
        existing.setIsFeatured(updatedTripBookings.getIsFeatured());


        return tripBookingsRepository.save(existing);
    }
}

package org.generation.socialNetwork.tours.repository;

import org.generation.socialNetwork.tours.model.TripStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripStatusHistoryRepository extends JpaRepository<TripStatusHistory, Long> {
    List<TripStatusHistory> findByTripId(Long tripId);
}

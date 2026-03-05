package org.generation.socialNetwork.tours.repository;

import org.generation.socialNetwork.tours.model.FavoriteTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteTourRepository extends JpaRepository<FavoriteTour, Long> {
    List<FavoriteTour> findByTouristId(Long touristId);
}

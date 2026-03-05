package org.generation.socialNetwork.tours.repository;

import org.generation.socialNetwork.tours.model.TourCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourCategoryRepository extends JpaRepository<TourCategory, Long> {

}
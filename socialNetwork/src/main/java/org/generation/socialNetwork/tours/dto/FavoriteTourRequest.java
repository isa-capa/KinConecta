package org.generation.socialNetwork.tours.dto;

public class FavoriteTourRequest {

    private Long touristId;
    private Long tourId;

    // Getters y Setters
    public Long getTouristId() { return touristId; }
    public void setTouristId(Long touristId) { this.touristId = touristId; }

    public Long getTourId() { return tourId; }
    public void setTourId(Long tourId) { this.tourId = tourId; }
}
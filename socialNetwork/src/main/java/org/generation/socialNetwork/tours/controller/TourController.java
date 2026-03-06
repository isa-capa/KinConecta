package org.generation.socialNetwork.tours.controller;

import org.generation.socialNetwork.tours.model.Destinations;
import org.generation.socialNetwork.tours.model.Tour;
import org.generation.socialNetwork.tours.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/tours") // http://localhost:8080/api/tours
public class TourController {
    // Inyección de dependencias por constructor
    private final TourService tourService;

    @Autowired
    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    @GetMapping // http://localhost:8080/api/tours
    public List<Tour> getAllTours() {
        return tourService.getAllTours();
    }

    @GetMapping(path = "/{tourId}") // http://localhost:8080/api/tours/id
    public Tour getTourById(@PathVariable("tourId") Long id) {
        return tourService.getTourById(id);
    }

    @PostMapping // http://localhost:8080/api/tours
    public Tour addTour(@RequestBody Tour tour) {
        return tourService.addTour(tour);
    }

    @DeleteMapping(path = "/{tourId}") // http://localhost:8080/api/tours/id
    public Tour deleteTourById(@PathVariable("tourId") Long id) {
        return tourService.deleteTourById(id);
    }

    @PutMapping(path = "/{tourId}") // http://localhost:8080/api/tours/id
    public Tour updateTourById(
            @PathVariable("tourId") Long id,
            @RequestBody Tour tour
    ) {
        return tourService.updateTourById(id, tour);
    }







    @PostMapping(path = "/{tourId}/add-destination")
    public Tour addTourDestination(@PathVariable("tourId") Long tourId){
        return tourService.addTourDestination(tourId);
    }
}

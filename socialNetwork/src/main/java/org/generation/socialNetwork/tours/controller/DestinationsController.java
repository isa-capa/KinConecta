package org.generation.socialNetwork.tours.controller;

import lombok.AllArgsConstructor;
import org.generation.socialNetwork.notifications.dto.NotificationsRequest;
import org.generation.socialNetwork.tours.model.Destinations;
import org.generation.socialNetwork.tours.model.TripBookings;
import org.generation.socialNetwork.tours.service.DestinationsService;
import org.generation.socialNetwork.tours.service.TripBookingsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kinconecta/api/tours/destinations") //http://localhost:8080/kinconecta/api/tours/destinations
@AllArgsConstructor
public class DestinationsController {
    private final DestinationsService destinationsService;


    //GET ALL Destinations
    @GetMapping
    public List<Destinations> getAllDestinations() {
        return destinationsService.getAllDestinations();
    }

    //GET DESTINATION BY ID
    @GetMapping(path = "/{destinationId}") //http://localhost:8080/kinconecta/api/tours/des
    public Destinations getDestinationsById(@PathVariable("destinationId") Long destinationId) {
        return destinationsService.getDestinationsById(destinationId);
    }

    //ADD DESTINATION
    @PostMapping
    public Destinations addDestinations(@RequestBody Destinations destinations) {
        return destinationsService.addDestinations(destinations);
    }

    //DELETE DESTINATION
    @DeleteMapping(path = "/{destinationId}")
    public Destinations deleteDestinations(@PathVariable("destinationId") Long destinationId) {
        return destinationsService.deleteDestinationById(destinationId);
    }


    @PutMapping(path = "{destinationId}")
    public Destinations updateDestinationsById(@PathVariable("destinationId") Long destinationId, @RequestBody Destinations destinations) {
        return destinationsService.updateDestinationsById(destinationId, destinations);
    }

    @PostMapping(path = "/{destinationId}/add-tour")
    public Destinations addTourDestination(@PathVariable("destinationId") Long destinationId){
        return destinationsService.addTourDestination(destinationId);
    }

}

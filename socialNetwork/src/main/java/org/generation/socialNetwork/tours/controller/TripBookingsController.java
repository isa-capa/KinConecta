package org.generation.socialNetwork.tours.controller;

import lombok.AllArgsConstructor;
import org.generation.socialNetwork.tours.model.TripBookings;
import org.generation.socialNetwork.tours.service.TripBookingsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/kinconecta/api/tours/trip-booking") //http://localhost:8080/kinconecta/api/tours/trip-booking
@AllArgsConstructor
public class TripBookingsController {

    private final TripBookingsService tripBookingsService;


    //GET ALL TRIP BOOKINGS
    @GetMapping
    public List<TripBookings> getAllTripBookings() {
        return tripBookingsService.getAllTripBookings();
    }

    //GET TRIP BY ID
    @GetMapping(path = "/{tripId}") //http://localhost:8080/kinconecta/api/tours/des
    public TripBookings getTripBookingsById(@PathVariable("tripId") Long tripId) {
        return tripBookingsService.getTripBookingsById(tripId);
    }

    //ADD TRIP
    @PostMapping
    public TripBookings addTripBookings(@RequestBody TripBookings tripBookings) {
        return tripBookingsService.addTripBookings(tripBookings);
    }

    @DeleteMapping(path = "/{tripId}")
    public TripBookings deleteTripBookingsById(@PathVariable("tripId") Long tripId) {
        return tripBookingsService.deleteTripBookingsById(tripId);
    }

    @PutMapping(path = "{tripId}")
    public TripBookings updateTripBookingsById(@PathVariable("tripId") Long tripId, @RequestBody TripBookings tripBookings) {
        return tripBookingsService.updateTripBookingsById(tripId, tripBookings);
    }

}

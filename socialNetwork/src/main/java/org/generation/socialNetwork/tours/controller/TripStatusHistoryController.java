package org.generation.socialNetwork.tours.controller;

import org.generation.socialNetwork.tours.model.TripStatusHistory;
import org.generation.socialNetwork.tours.service.TripStatusHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/trip-status-history") // http://localhost:8080/api/trip-status-history
public class TripStatusHistoryController {

    private final TripStatusHistoryService tripStatusHistoryService;

    @Autowired
    public TripStatusHistoryController(TripStatusHistoryService tripStatusHistoryService) {
        this.tripStatusHistoryService = tripStatusHistoryService;
    }

    @GetMapping // http://localhost:8080/api/trip-status-history
    public List<TripStatusHistory> getAllHistory() {
        return tripStatusHistoryService.getAllHistory();
    }

    @GetMapping(path = "/{historyId}") // http://localhost:8080/api/trip-status-history/id
    public TripStatusHistory getHistoryById(@PathVariable("historyId") Long id) {
        return tripStatusHistoryService.getHistoryById(id);
    }

    @GetMapping(path = "/trip/{tripId}") // http://localhost:8080/api/trip-status-history/trip/id
    public List<TripStatusHistory> getHistoryByTripId(@PathVariable("tripId") Long tripId) {
        return tripStatusHistoryService.getHistoryByTripId(tripId);
    }

    @PostMapping // http://localhost:8080/api/trip-status-history
    public TripStatusHistory addHistory(@RequestBody TripStatusHistory history) {
        return tripStatusHistoryService.addHistory(history);
    }

    @DeleteMapping(path = "/{historyId}") // http://localhost:8080/api/trip-status-history/id
    public TripStatusHistory deleteHistoryById(@PathVariable("historyId") Long id) {
        return tripStatusHistoryService.deleteHistoryById(id);
    }
}
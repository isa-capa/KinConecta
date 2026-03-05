package org.generation.socialNetwork.tours.controller;

import org.generation.socialNetwork.tours.model.FavoriteTour;
import org.generation.socialNetwork.tours.service.FavoriteTourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/favorite-tours") // http://localhost:8080/api/favorite-tours
public class FavoriteTourController {

    private final FavoriteTourService favoriteTourService;

    @Autowired
    public FavoriteTourController(FavoriteTourService favoriteTourService) {
        this.favoriteTourService = favoriteTourService;
    }

    @GetMapping // http://localhost:8080/api/favorite-tours
    public List<FavoriteTour> getAllFavorites() {
        return favoriteTourService.getAllFavorites();
    }

    @GetMapping(path = "/{favoriteId}") // http://localhost:8080/api/favorite-tours/id
    public FavoriteTour getFavoriteById(@PathVariable("favoriteId") Long id) {
        return favoriteTourService.getFavoriteById(id);
    }

    @GetMapping(path = "/tourist/{touristId}") // http://localhost:8080/api/favorite-tours/tourist/id
    public List<FavoriteTour> getFavoritesByTouristId(@PathVariable("touristId") Long touristId) {
        return favoriteTourService.getFavoritesByTouristId(touristId);
    }

    @PostMapping // http://localhost:8080/api/favorite-tours
    public FavoriteTour addFavorite(@RequestBody FavoriteTour favoriteTour) {
        return favoriteTourService.addFavorite(favoriteTour);
    }

    @DeleteMapping(path = "/{favoriteId}") // http://localhost:8080/api/favorite-tours/id
    public FavoriteTour deleteFavoriteById(@PathVariable("favoriteId") Long id) {
        return favoriteTourService.deleteFavoriteById(id);
    }
}
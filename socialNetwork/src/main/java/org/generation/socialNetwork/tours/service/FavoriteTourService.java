package org.generation.socialNetwork.tours.service;

import org.generation.socialNetwork.tours.model.FavoriteTour;
import org.generation.socialNetwork.tours.repository.FavoriteTourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteTourService {

    private final FavoriteTourRepository favoriteTourRepository;

    @Autowired
    public FavoriteTourService(FavoriteTourRepository favoriteTourRepository) {
        this.favoriteTourRepository = favoriteTourRepository;
    }

    // Obtener todos los favoritos
    public List<FavoriteTour> getAllFavorites() {
        return favoriteTourRepository.findAll();
    }

    // Obtener favorito por ID
    public FavoriteTour getFavoriteById(Long id) {
        return favoriteTourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Favorito no encontrado con id: " + id));
    }

    // Obtener favoritos por tourist
    public List<FavoriteTour> getFavoritesByTouristId(Long touristId) {
        return favoriteTourRepository.findByTouristId(touristId);
    }

    // Agregar favorito
    public FavoriteTour addFavorite(FavoriteTour favoriteTour) {
        return favoriteTourRepository.save(favoriteTour);
    }

    // Eliminar favorito por ID
    public FavoriteTour deleteFavoriteById(Long id) {
        FavoriteTour favorite = getFavoriteById(id);
        favoriteTourRepository.deleteById(id);
        return favorite;
    }
}


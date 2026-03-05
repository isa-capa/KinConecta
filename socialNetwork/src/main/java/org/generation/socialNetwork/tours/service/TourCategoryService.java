package org.generation.socialNetwork.tours.service;

import org.generation.socialNetwork.tours.model.TourCategory;
import org.generation.socialNetwork.tours.repository.TourCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TourCategoryService {

    // Inyección de dependencias por constructor
    private final TourCategoryRepository tourCategoryRepository;

    @Autowired
    public TourCategoryService(TourCategoryRepository tourCategoryRepository) {
        this.tourCategoryRepository = tourCategoryRepository;
    }

    // Obtener todas las categorías
    public List<TourCategory> getAllCategories() {
        return tourCategoryRepository.findAll();
    }

    // Obtener categoría por ID
    public TourCategory getCategoryById(Long id) {
        return tourCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + id));
    }

    // Agregar nueva categoría
    public TourCategory addCategory(TourCategory category) {
        return tourCategoryRepository.save(category);
    }

    // Eliminar categoría por ID
    public TourCategory deleteCategoryById(Long id) {
        TourCategory category = getCategoryById(id);
        tourCategoryRepository.deleteById(id);
        return category;
    }

    // Actualizar categoría por ID
    public TourCategory updateCategoryById(Long id, TourCategory updatedCategory) {
        TourCategory existing = getCategoryById(id);

        existing.setName(updatedCategory.getName());

        return tourCategoryRepository.save(existing);
    }
}

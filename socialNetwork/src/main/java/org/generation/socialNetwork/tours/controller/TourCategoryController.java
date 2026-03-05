package org.generation.socialNetwork.tours.controller;

import org.generation.socialNetwork.tours.model.TourCategory;
import org.generation.socialNetwork.tours.service.TourCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/tour-categories") // http://localhost:8080/api/tour-categories
public class TourCategoryController {

    // Inyección de dependencias por constructor
    private final TourCategoryService tourCategoryService;

    @Autowired
    public TourCategoryController(TourCategoryService tourCategoryService) {
        this.tourCategoryService = tourCategoryService;
    }

    @GetMapping // http://localhost:8080/api/tour-categories
    public List<TourCategory> getAllCategories() {
        return tourCategoryService.getAllCategories();
    }

    @GetMapping(path = "/{categoryId}") // http://localhost:8080/api/tour-categories/id
    public TourCategory getCategoryById(@PathVariable("categoryId") Long id) {
        return tourCategoryService.getCategoryById(id);
    }

    @PostMapping // http://localhost:8080/api/tour-categories
    public TourCategory addCategory(@RequestBody TourCategory category) {
        return tourCategoryService.addCategory(category);
    }

    @DeleteMapping(path = "/{categoryId}") // http://localhost:8080/api/tour-categories/id
    public TourCategory deleteCategoryById(@PathVariable("categoryId") Long id) {
        return tourCategoryService.deleteCategoryById(id);
    }

    @PutMapping(path = "/{categoryId}") // http://localhost:8080/api/tour-categories/id
    public TourCategory updateCategoryById(
            @PathVariable("categoryId") Long id,
            @RequestBody TourCategory category
    ) {
        return tourCategoryService.updateCategoryById(id, category);
    }
}
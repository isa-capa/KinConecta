package org.generation.socialNetwork.faq.controller;

import org.generation.socialNetwork.faq.model.FaqCategory;
import org.generation.socialNetwork.faq.service.FaqCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faq-categories")
public class FaqCategoryController {

    @Autowired
    private FaqCategoryService faqCategoryService;

    @GetMapping
    public List<FaqCategory> getAllFaqCategories() {
        return faqCategoryService.getAllFaqCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqCategory> getFaqCategoryById(@PathVariable Integer id) {
        return faqCategoryService.getFaqCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FaqCategory createFaqCategory(@RequestBody FaqCategory faqCategory) {
        return faqCategoryService.createFaqCategory(faqCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqCategory> updateFaqCategory(@PathVariable Integer id, @RequestBody FaqCategory faqCategoryDetails) {
        FaqCategory updatedFaqCategory = faqCategoryService.updateFaqCategory(id, faqCategoryDetails);
        if (updatedFaqCategory != null) {
            return ResponseEntity.ok(updatedFaqCategory);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaqCategory(@PathVariable Integer id) {
        faqCategoryService.deleteFaqCategory(id);
        return ResponseEntity.noContent().build();
    }
}
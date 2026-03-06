package org.generation.socialNetwork.faq.controller;

import org.generation.socialNetwork.faq.model.FaqItem;
import org.generation.socialNetwork.faq.service.FaqItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faq-items")
public class FaqItemController {

    @Autowired
    private FaqItemService faqItemService;

    @GetMapping
    public List<FaqItem> getAllFaqItems() {
        return faqItemService.getAllFaqItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqItem> getFaqItemById(@PathVariable Long id) {
        return faqItemService.getFaqItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FaqItem createFaqItem(@RequestBody FaqItem faqItem) {
        return faqItemService.createFaqItem(faqItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqItem> updateFaqItem(@PathVariable Long id, @RequestBody FaqItem faqItemDetails) {
        FaqItem updatedFaqItem = faqItemService.updateFaqItem(id, faqItemDetails);
        if (updatedFaqItem != null) {
            return ResponseEntity.ok(updatedFaqItem);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaqItem(@PathVariable Long id) {
        faqItemService.deleteFaqItem(id);
        return ResponseEntity.noContent().build();
    }
}
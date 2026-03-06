package org.generation.socialNetwork.reviews.controller;

import org.generation.socialNetwork.reviews.model.ReviewReply;
import org.generation.socialNetwork.reviews.service.ReviewReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-replies")
public class ReviewReplyController {

    @Autowired
    private ReviewReplyService reviewReplyService;

    @GetMapping
    public List<ReviewReply> getAllReviewReplies() {
        return reviewReplyService.getAllReviewReplies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewReply> getReviewReplyById(@PathVariable Long id) {
        return reviewReplyService.getReviewReplyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ReviewReply createReviewReply(@RequestBody ReviewReply reviewReply) {
        return reviewReplyService.createReviewReply(reviewReply);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewReply> updateReviewReply(@PathVariable Long id, @RequestBody ReviewReply reviewReplyDetails) {
        ReviewReply updatedReviewReply = reviewReplyService.updateReviewReply(id, reviewReplyDetails);
        if (updatedReviewReply != null) {
            return ResponseEntity.ok(updatedReviewReply);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReviewReply(@PathVariable Long id) {
        reviewReplyService.deleteReviewReply(id);
        return ResponseEntity.noContent().build();
    }
}
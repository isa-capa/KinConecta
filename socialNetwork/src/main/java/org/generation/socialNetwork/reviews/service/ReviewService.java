package org.generation.socialNetwork.reviews.service;

import org.generation.socialNetwork.reviews.model.Review;
import org.generation.socialNetwork.reviews.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, Review reviewDetails) {
        Optional<Review> optionalReview = reviewRepository.findById(id);
        if (optionalReview.isPresent()) {
            Review review = optionalReview.get();
            // Update fields as needed
            review.setRating(reviewDetails.getRating());
            review.setComment(reviewDetails.getComment());
            review.setLikesCount(reviewDetails.getLikesCount());
            review.setRepliesCount(reviewDetails.getRepliesCount());
            review.setUpdatedAt(reviewDetails.getUpdatedAt());
            review.setDeletedAt(reviewDetails.getDeletedAt());
            return reviewRepository.save(review);
        }
        return null;
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}

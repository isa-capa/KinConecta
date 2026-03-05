package org.generation.socialNetwork.reviews.service;

import org.generation.socialNetwork.reviews.model.ReviewReply;
import org.generation.socialNetwork.reviews.repository.ReviewReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewReplyService {

    @Autowired
    private ReviewReplyRepository reviewReplyRepository;

    public List<ReviewReply> getAllReviewReplies() {
        return reviewReplyRepository.findAll();
    }

    public Optional<ReviewReply> getReviewReplyById(Long id) {
        return reviewReplyRepository.findById(id);
    }

    public ReviewReply createReviewReply(ReviewReply reviewReply) {
        return reviewReplyRepository.save(reviewReply);
    }

    public ReviewReply updateReviewReply(Long id, ReviewReply reviewReplyDetails) {
        Optional<ReviewReply> optionalReviewReply = reviewReplyRepository.findById(id);
        if (optionalReviewReply.isPresent()) {
            ReviewReply reviewReply = optionalReviewReply.get();
            reviewReply.setMessage(reviewReplyDetails.getMessage());
            reviewReply.setUpdatedAt(reviewReplyDetails.getUpdatedAt());
            return reviewReplyRepository.save(reviewReply);
        }
        return null;
    }

    public void deleteReviewReply(Long id) {
        reviewReplyRepository.deleteById(id);
    }
}
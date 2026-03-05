package org.generation.socialNetwork.reviews.repository;

import org.generation.socialNetwork.reviews.model.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
}
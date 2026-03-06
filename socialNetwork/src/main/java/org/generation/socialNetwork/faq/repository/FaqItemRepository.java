package org.generation.socialNetwork.faq.repository;

import org.generation.socialNetwork.faq.model.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaqItemRepository extends JpaRepository<FaqItem, Long> {
}
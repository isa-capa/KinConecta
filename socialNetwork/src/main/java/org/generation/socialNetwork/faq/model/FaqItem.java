package org.generation.socialNetwork.faq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faq_items")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FaqItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_item_id")
    private Long id;

    @Column(name = "faq_category_id", nullable = false)
    private Integer faqCategoryId;

    @Column(name = "question", nullable = false, length = 300)
    private String question;

    @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    private Short sortOrder = 0;
}
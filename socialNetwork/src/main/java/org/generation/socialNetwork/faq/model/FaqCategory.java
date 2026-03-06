package org.generation.socialNetwork.faq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faq_categories")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FaqCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_category_id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "role_scope", nullable = false, columnDefinition = "ENUM('guide', 'tourist', 'both') DEFAULT 'both'")
    private String roleScope;

    @Column(name = "sort_order", nullable = false)
    private Short sortOrder = 0;
}
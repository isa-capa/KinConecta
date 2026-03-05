package org.generation.socialNetwork.tours.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tour_categories")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TourCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(name = "tour_categories")
    private String name;
}

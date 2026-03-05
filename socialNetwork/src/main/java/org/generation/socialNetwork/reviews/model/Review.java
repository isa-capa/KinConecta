package org.generation.socialNetwork.reviews.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "reviews")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "tour_id", nullable = false)
    private Long tourId;

    @Column(name = "guide_id", nullable = false)
    private Long guideId;

    @Column(name = "tourist_id", nullable = false)
    private Long touristId;

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "comment")
    private String comment;

    @Column(name = "likes_count", nullable = false)
    private Integer likesCount = 0;

    @Column(name = "replies_count", nullable = false)
    private Integer repliesCount = 0;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;

    @Column(name = "deleted_at")
    private Date deletedAt;
}

package org.generation.socialNetwork.tours.model;

import jakarta.persistence.*;
import jakarta.transaction.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.generation.socialNetwork.notifications.model.Notifications;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tours")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tour_id")
    private Long tourId;

    @Column(name = "guide_id")
    private Long guideId;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "title", length = 180)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "duration_hours", precision = 4, scale = 1)
    private BigDecimal durationHours;

    @Column(name = "max_group_size")
    private Short maxGroupSize;

    @Column(name = "meeting_point", length = 255)
    private String meetingPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('draft', 'pending', 'active', 'inactive')")
    private Status status;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "image_class", length = 80)
    private String imageClass;

    @Column(name = "rating_avg", precision = 3, scale = 2)
    private BigDecimal ratingAvg;

    @Column(name = "bookings_count")
    private Integer bookingsCount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }












    @OneToMany(mappedBy = "tour_id", cascade = CascadeType.ALL)
    private List<TourDestination> tourDestinations;

}

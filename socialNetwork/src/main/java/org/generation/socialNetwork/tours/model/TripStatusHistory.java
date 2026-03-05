package org.generation.socialNetwork.tours.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.generation.socialNetwork.tours.converter.TripStatusConverter;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_status_history")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TripStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "trip_id")
    private Long tripId;

    @Convert(converter = TripStatusConverter.class)
    @Column(name = "old_status")
    private TripStatus oldStatus;

    @Convert(converter = TripStatusConverter.class)
    @Column(name = "new_status")
    private TripStatus newStatus;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "changed_by_user_id")
    private Long changedByUserId;

    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}

package org.generation.socialNetwork.tours.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.w3c.dom.Text;

import java.util.Date;


//Lombok
@Entity
@Table(name="trip_bookings")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TripBookings {
    @Id
    @GeneratedValue
    @Column(unique=true, nullable=false)
    private Long tripId;

    @Column(nullable=false, name="start_datetime")
    private Date startDatetime;

    @Column(nullable = false, name="end_datetime")
    private Date endDatetime;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status")
    private TripStatus status;

    @Column(name="cancel_reason")
    private String cancelReason;

    @Column
    private Text notes;

    @Column(nullable = false, name="created_at")
    private java.sql.Date createdAt;

    @Column(nullable = false, name="updated_at")
    private Date updatedAt;

    @Column(name="is_featured")
    private Character isFeatured;

    private


}

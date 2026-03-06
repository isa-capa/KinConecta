package org.generation.socialNetwork.tours.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="tour_destination")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TourDestination {

    @ManyToOne
    @JoinColumn(name = "tours_id", nullable = false)
    @JsonIgnore
    private Long toursId;

    @ManyToOne
    @JoinColumn(name = "destinations_id", nullable = false)
    @JsonIgnore
    private Long destinationsId;
}

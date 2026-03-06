package org.generation.socialNetwork.tours.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "destinations")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Destinations {
    @Id
    @GeneratedValue
    @Column(unique=true, nullable=false, name="destination_id")
    private Long destinationId;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false,name="featured")
    private Byte featured;








    @OneToMany(mappedBy = "destination_id", cascade = CascadeType.ALL)
    private List<TourDestination> tourDestinations;

}

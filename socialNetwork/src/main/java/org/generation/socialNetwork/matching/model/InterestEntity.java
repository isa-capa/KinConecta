package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "interests")
public class InterestEntity {

    @Id
    @Column(name = "interest_id")
    private Integer interestId;

    @Column(name = "name")
    private String name;

    public Integer getInterestId() {
        return interestId;
    }

    public String getName() {
        return name;
    }
}

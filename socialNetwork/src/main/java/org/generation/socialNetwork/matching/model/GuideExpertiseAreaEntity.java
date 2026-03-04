package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "guide_expertise_areas")
public class GuideExpertiseAreaEntity {

    @Id
    @Column(name = "expertise_id")
    private Integer expertiseId;

    @Column(name = "name")
    private String name;

    public Integer getExpertiseId() {
        return expertiseId;
    }

    public String getName() {
        return name;
    }
}

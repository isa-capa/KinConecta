package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "guide_locations")
public class GuideLocationEntity {

    @Id
    @Column(name = "guide_location_id")
    private Long guideLocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private GuideProfileEntity guideProfile;

    @Column(name = "location_name")
    private String locationName;

    public Long getGuideLocationId() {
        return guideLocationId;
    }

    public GuideProfileEntity getGuideProfile() {
        return guideProfile;
    }

    public String getLocationName() {
        return locationName;
    }
}

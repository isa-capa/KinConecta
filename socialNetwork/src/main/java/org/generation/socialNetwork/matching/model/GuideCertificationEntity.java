package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "guide_certifications")
public class GuideCertificationEntity {

    @Id
    @Column(name = "certification_id")
    private Long certificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private GuideProfileEntity guideProfile;

    @Column(name = "name")
    private String name;

    public Long getCertificationId() {
        return certificationId;
    }

    public GuideProfileEntity getGuideProfile() {
        return guideProfile;
    }

    public String getName() {
        return name;
    }
}

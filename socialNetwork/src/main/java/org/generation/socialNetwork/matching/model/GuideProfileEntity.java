package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "guide_profiles")
public class GuideProfileEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "rating_avg")
    private BigDecimal ratingAvg;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "location_label")
    private String locationLabel;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "style")
    private String style;

    @Column(name = "group_size")
    private String groupSize;

    @Column(name = "tour_intensity")
    private String tourIntensity;

    @Column(name = "transport_offered")
    private String transportOffered;

    @Column(name = "photo_style")
    private String photoStyle;

    @Column(name = "additional_notes")
    private String additionalNotes;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "guide_profile_languages",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "language_code")
    )
    private Set<LanguageEntity> languages = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "guide_profile_expertise",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "expertise_id")
    )
    private Set<GuideExpertiseAreaEntity> expertiseAreas = new HashSet<>();

    @OneToMany(mappedBy = "guideProfile", fetch = FetchType.LAZY)
    private Set<GuideLocationEntity> locations = new HashSet<>();

    @OneToMany(mappedBy = "guideProfile", fetch = FetchType.LAZY)
    private Set<GuideCertificationEntity> certifications = new HashSet<>();

    @OneToMany(mappedBy = "guideProfile", fetch = FetchType.LAZY)
    private Set<GuideAdaptationEntity> adaptations = new HashSet<>();

    public Long getUserId() {
        return userId;
    }

    public UserEntity getUser() {
        return user;
    }

    public BigDecimal getRatingAvg() {
        return ratingAvg;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public String getLocationLabel() {
        return locationLabel;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public String getStyle() {
        return style;
    }

    public String getGroupSize() {
        return groupSize;
    }

    public String getTourIntensity() {
        return tourIntensity;
    }

    public String getTransportOffered() {
        return transportOffered;
    }

    public String getPhotoStyle() {
        return photoStyle;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public Set<LanguageEntity> getLanguages() {
        return languages;
    }

    public Set<GuideExpertiseAreaEntity> getExpertiseAreas() {
        return expertiseAreas;
    }

    public Set<GuideLocationEntity> getLocations() {
        return locations;
    }

    public Set<GuideCertificationEntity> getCertifications() {
        return certifications;
    }

    public Set<GuideAdaptationEntity> getAdaptations() {
        return adaptations;
    }
}

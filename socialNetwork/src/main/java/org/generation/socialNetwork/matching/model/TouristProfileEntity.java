package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tourist_profiles")
public class TouristProfileEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "location")
    private String location;

    @Column(name = "travel_style")
    private String travelStyle;

    @Column(name = "trip_type")
    private String tripType;

    @Column(name = "pace_and_company")
    private String paceAndCompany;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "group_preference")
    private String groupPreference;

    @Column(name = "dietary_preferences")
    private String dietaryPreferences;

    @Column(name = "planning_level")
    private String planningLevel;

    @Column(name = "amenities")
    private String amenities;

    @Column(name = "transport")
    private String transport;

    @Column(name = "photo_preference")
    private String photoPreference;

    @Column(name = "accessibility")
    private String accessibility;

    @Column(name = "additional_notes")
    private String additionalNotes;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tourist_profile_languages",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "language_code")
    )
    private Set<LanguageEntity> languages = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tourist_profile_interests",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    private Set<InterestEntity> interests = new HashSet<>();

    public Long getUserId() {
        return userId;
    }

    public UserEntity getUser() {
        return user;
    }

    public String getLocation() {
        return location;
    }

    public String getTravelStyle() {
        return travelStyle;
    }

    public String getTripType() {
        return tripType;
    }

    public String getPaceAndCompany() {
        return paceAndCompany;
    }

    public String getActivityLevel() {
        return activityLevel;
    }

    public String getGroupPreference() {
        return groupPreference;
    }

    public String getDietaryPreferences() {
        return dietaryPreferences;
    }

    public String getPlanningLevel() {
        return planningLevel;
    }

    public String getAmenities() {
        return amenities;
    }

    public String getTransport() {
        return transport;
    }

    public String getPhotoPreference() {
        return photoPreference;
    }

    public String getAccessibility() {
        return accessibility;
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

    public Set<InterestEntity> getInterests() {
        return interests;
    }
}

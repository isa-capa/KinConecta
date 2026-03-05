package org.generation.socialNetwork.profileGuide.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.generation.socialNetwork.profileGuide.model.*;

@Getter
@Setter
@NoArgsConstructor
public class GuideProfileUpdateRequestDTO {

    private String summary;
    private String story;
    private String statusText;
    private BigDecimal hourlyRate;
    private String currency;
    private BigDecimal ratingAvg;
    private Integer reviewsCount;
    private String locationLabel;
    private String experienceLevel;
    private String style;
    private String groupSize;
    private String tourIntensity;
    private String transportOffered;
    private String photoStyle;
    private String additionalNotes;
    private String avatarUrl;
    private String coverUrl;
    private String postText;
    private String postImageUrl;
    private String postCaption;
    private LocalDateTime postPublishedAt;
    private LocalDateTime updatedAt;
}
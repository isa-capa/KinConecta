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
public class GuideCalendarEventUpdateRequestDTO {

    private Long guideId;
    private Long tripId;
    private GuideCalendarEventEventType eventType;
    private String title;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String organizerName;
    private GuideCalendarEventSource source;
    private GuideCalendarEventStatus status;
    private LocalDateTime createdAt;
}
package org.generation.socialNetwork.notifications.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class NotificationsRequest {
    private  String type;
    private String title;
    private String body;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Boolean idRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

}

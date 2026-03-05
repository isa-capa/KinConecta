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
public class GuideCertificationUpdateRequestDTO {

    private Long userId;
    private String name;
}
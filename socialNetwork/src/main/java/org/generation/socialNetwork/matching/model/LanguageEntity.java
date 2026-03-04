package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "languages")
public class LanguageEntity {

    @Id
    @Column(name = "language_code")
    private String languageCode;

    @Column(name = "name")
    private String name;

    public String getLanguageCode() {
        return languageCode;
    }

    public String getName() {
        return name;
    }
}

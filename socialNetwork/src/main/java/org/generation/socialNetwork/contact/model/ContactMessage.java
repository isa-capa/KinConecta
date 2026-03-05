package org.generation.socialNetwork.contact.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "contact_messages")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contact_message_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "email", nullable = false, length = 190)
    private String email;

    @Column(name = "subject", nullable = false, length = 180)
    private String subject;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "source_page", length = 120)
    private String sourcePage;

    @Column(name = "status", nullable = false, columnDefinition = "ENUM('new', 'read', 'archived') DEFAULT 'new'")
    private String status;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;
}
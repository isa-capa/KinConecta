package org.generation.socialNetwork.matching.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "role")
    private String role;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "account_status")
    private String accountStatus;

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAccountStatus() {
        return accountStatus;
    }
}

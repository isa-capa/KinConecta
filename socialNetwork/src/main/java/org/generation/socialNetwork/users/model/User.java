package generation.socialNetwork.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

//Lombok
@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue
    @Column(unique = true, nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    @Column(nullable = false, name="full_name")
    private String fullName;

    @Column(nullable = false, name="date_of_birth")
    private java.sql.Date dateOfBirth; //Considerar valor que manda la opción de frontend

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, name="country_code")
    private String countryCode;

    @Column(nullable = false, name="phone_number")
    private String phoneNumber; //Considerar valor que manda la opción de frontend

    @Column(nullable = false, name = "phone_e164")
    private String phoneE164;

    @Enumerated(EnumType.STRING) //Considerar valor que manda el frontend
    @Column(nullable = false,name="prefered_language_code")
    private Language preferedLanguageCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name="account_status")
    private AccountStatus accountStatus;

    @Column(nullable = false, name="email_verified_at")
    private Date emailVerifiedAt;

    @Column(nullable = false, name="last_login")
    private Date lastLogin;

    @Column(nullable = false, name="created_at")
    private Date createdAt;

    @Column(nullable = false, name="updated_at")
    private Date updatedAt;

}

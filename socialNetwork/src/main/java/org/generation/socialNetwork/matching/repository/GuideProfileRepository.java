package generation.socialNetwork.matching.repository;

import org.generation.socialNetwork.matching.model.GuideProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GuideProfileRepository extends JpaRepository<GuideProfileEntity, Long> {

    @Query("""
            select distinct gp
            from GuideProfileEntity gp
            join fetch gp.user user
            left join fetch gp.languages languages
            left join fetch gp.expertiseAreas expertiseAreas
            left join fetch gp.locations locations
            left join fetch gp.certifications certifications
            left join fetch gp.adaptations adaptations
            where gp.userId = :userId
            """)
    Optional<GuideProfileEntity> findDetailedByUserId(@Param("userId") Long userId);

    @Query("""
            select distinct gp
            from GuideProfileEntity gp
            join fetch gp.user user
            left join fetch gp.languages languages
            left join fetch gp.expertiseAreas expertiseAreas
            left join fetch gp.locations locations
            left join fetch gp.certifications certifications
            left join fetch gp.adaptations adaptations
            where user.role = 'guide'
              and user.accountStatus = 'active'
            """)
    List<GuideProfileEntity> findAllActiveGuideCandidates();
}

package org.generation.socialNetwork.matching.repository;

import org.generation.socialNetwork.matching.model.TouristProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TouristProfileRepository extends JpaRepository<TouristProfileEntity, Long> {

    @Query("""
            select distinct tp
            from TouristProfileEntity tp
            join fetch tp.user user
            left join fetch tp.languages languages
            left join fetch tp.interests interests
            where tp.userId = :userId
            """)
    Optional<TouristProfileEntity> findDetailedByUserId(@Param("userId") Long userId);

    @Query("""
            select distinct tp
            from TouristProfileEntity tp
            join fetch tp.user user
            left join fetch tp.languages languages
            left join fetch tp.interests interests
            where user.role = 'tourist'
              and user.accountStatus = 'active'
            """)
    List<TouristProfileEntity> findAllActiveTouristCandidates();
}

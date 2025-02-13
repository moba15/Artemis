package de.tum.in.www1.artemis.repository;

import static de.tum.in.www1.artemis.config.Constants.PROFILE_CORE;

import java.util.Set;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.tum.in.www1.artemis.domain.StaticCodeAnalysisCategory;

/**
 * Spring Data repository for the StaticCodeAnalysisCategory entity.
 */
@Profile(PROFILE_CORE)
@Repository
public interface StaticCodeAnalysisCategoryRepository extends JpaRepository<StaticCodeAnalysisCategory, Long> {

    Set<StaticCodeAnalysisCategory> findByExerciseId(long exerciseId);
}

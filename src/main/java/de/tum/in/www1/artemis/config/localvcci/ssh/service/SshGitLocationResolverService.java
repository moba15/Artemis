package de.tum.in.www1.artemis.config.localvcci.ssh.service;

import static de.tum.in.www1.artemis.config.Constants.PROFILE_LOCALVC;
import static de.tum.in.www1.artemis.config.localvcci.ssh.SshConstants.USER_KEY;

import java.io.IOException;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.sshd.git.GitLocationResolver;
import org.apache.sshd.server.session.ServerSession;
import org.eclipse.jgit.lib.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import de.tum.in.www1.artemis.domain.ProgrammingExercise;
import de.tum.in.www1.artemis.exception.localvc.LocalVCForbiddenException;
import de.tum.in.www1.artemis.exception.localvc.LocalVCInternalException;
import de.tum.in.www1.artemis.repository.ProgrammingExerciseRepository;
import de.tum.in.www1.artemis.service.connectors.localvc.LocalVCRepositoryUri;
import de.tum.in.www1.artemis.service.connectors.localvc.LocalVCServletService;
import de.tum.in.www1.artemis.web.rest.errors.EntityNotFoundException;
import de.tum.in.www1.artemis.web.rest.repository.RepositoryActionType;

@Profile(PROFILE_LOCALVC)
@Service
public class SshGitLocationResolverService implements GitLocationResolver {

    private static final Logger log = LoggerFactory.getLogger(SshGitLocationResolverService.class);

    @Value("${artemis.version-control.url}")
    private URL localVCBaseUrl;

    private final LocalVCServletService localVCServletService;

    private final ProgrammingExerciseRepository programmingExerciseRepository;

    public SshGitLocationResolverService(LocalVCServletService localVCServletService, ProgrammingExerciseRepository programmingExerciseRepository) {
        this.localVCServletService = localVCServletService;
        this.programmingExerciseRepository = programmingExerciseRepository;
    }

    @Override
    public Path resolveRootDirectory(String command, String[] args, ServerSession session, FileSystem fs) throws IOException {
        // Note: we need to double check read / write access based

        String repositoryPath = args[1];
        // We need to remove the '/git/' in the beginning
        if (repositoryPath.startsWith("/git/")) {
            repositoryPath = repositoryPath.substring(5);
        }

        final var gitCommand = args[0];
        final var localVCRepositoryUri = new LocalVCRepositoryUri(Paths.get(repositoryPath), localVCBaseUrl);
        final var projectKey = localVCRepositoryUri.getProjectKey();
        final var repositoryTypeOrUserName = localVCRepositoryUri.getRepositoryTypeOrUserName();
        ProgrammingExercise exercise;

        try {
            exercise = programmingExerciseRepository.findOneByProjectKeyOrThrow(projectKey, true);
        }
        catch (EntityNotFoundException e) {
            throw new LocalVCInternalException("Could not find single programming exercise with project key " + projectKey, e);
        }

        // git-upload-pack means fetch (read operation), git-receive-pack means push (write operation)
        final var repositoryAction = gitCommand.equals("git-upload-pack") ? RepositoryActionType.READ : gitCommand.equals("git-receive-pack") ? RepositoryActionType.WRITE : null;
        final var user = session.getAttribute(USER_KEY);
        try {
            localVCServletService.authorizeUser(repositoryTypeOrUserName, user, exercise, repositoryAction, localVCRepositoryUri.isPracticeRepository());
        }
        catch (LocalVCForbiddenException e) {
            log.error("User {} does not have access to the repository {}", user.getLogin(), repositoryPath);
            throw new AccessDeniedException("User does not have access to this repository", e);
        }

        // we cannot trust unvalidated user input
        final var localRepositoryPath = localVCRepositoryUri.getRelativeRepositoryPath().toString();
        try (Repository repo = localVCServletService.resolveRepository(localRepositoryPath)) {
            return repo.getDirectory().toPath();
        }
    }
}

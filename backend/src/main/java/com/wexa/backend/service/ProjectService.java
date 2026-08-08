package com.wexa.backend.service;

import com.wexa.backend.model.Project;
import com.wexa.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repository;

    public ProjectService(ProjectRepository repository) {
        this.repository = repository;
    }

    public void save(Project project) {
        repository.save(project);
    }

    public List<Project> getAllProjects() {
        return repository.findAll();
    }

    public Project getProject(String projectId) {
        return repository.findById(projectId);
    }

    public void update(Project project) {
        repository.update(project);
    }

    public void delete(String projectId) {
        repository.delete(projectId);
    }
}
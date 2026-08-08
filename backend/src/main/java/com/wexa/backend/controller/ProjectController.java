package com.wexa.backend.controller;

import com.wexa.backend.model.Project;
import com.wexa.backend.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@CrossOrigin("*")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @PostMapping
    public String create(@RequestBody Project project) {

        service.save(project);

        return "Project Created Successfully";
    }

    @GetMapping
    public List<Project> getAll() {
        return service.getAllProjects();
    }

    @GetMapping("/{projectId}")
    public Project get(@PathVariable String projectId) {
        return service.getProject(projectId);
    }

    @PutMapping("/{projectId}")
    public String update(@PathVariable String projectId,
                         @RequestBody Project project) {

        project.setProjectId(projectId);

        service.update(project);

        return "Project Updated Successfully";
    }

    @DeleteMapping("/{projectId}")
    public String delete(@PathVariable String projectId) {

        service.delete(projectId);

        return "Project Deleted Successfully";
    }
}
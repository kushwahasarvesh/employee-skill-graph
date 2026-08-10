package com.wexa.backend.controller;

import com.wexa.backend.model.Project;
import com.wexa.backend.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@CrossOrigin("*")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody Project project) {

        service.save(project);

        return ResponseEntity.ok(Map.of("message","Project Created Successfully"));
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
    public ResponseEntity<Map<String, String>> update(@PathVariable String projectId,
                         @RequestBody Project project) {

        project.setProjectId(projectId);

        service.update(project);

        return ResponseEntity.ok(Map.of("message","Project Updated Successfully"));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Map<String, String>>  delete(@PathVariable String projectId) {

        service.delete(projectId);

        return ResponseEntity.ok(Map.of("message","Project Deleted Successfully"));
    }
}
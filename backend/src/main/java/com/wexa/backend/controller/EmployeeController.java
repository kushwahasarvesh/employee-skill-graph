package com.wexa.backend.controller;

import com.wexa.backend.model.Employee;
import com.wexa.backend.model.Project;
import com.wexa.backend.model.Recommendation;
import com.wexa.backend.model.ReportingPath;
import com.wexa.backend.model.Skill;
import com.wexa.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@CrossOrigin("*")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody Employee employee) {

        service.save(employee);

        return ResponseEntity.ok(Map.of("message", "Employee Created Successfully"));
    }

    @GetMapping
    public List<Employee> getAll() {
        return service.getAllEmployees();
    }

    @GetMapping("/{employeeId}")
    public Employee get(@PathVariable String employeeId) {
        return service.getEmployee(employeeId);
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<Map<String, String>> update(@PathVariable String employeeId,
                                                      @RequestBody Employee employee) {

        employee.setEmployeeId(employeeId);

        service.update(employee);

        return ResponseEntity.ok( Map.of("message", "Employee Updated Successfully"));
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String employeeId) {

        service.delete(employeeId);

        return ResponseEntity.ok( Map.of("message", "Employee Deleted Successfully"));
    }

    @PostMapping("/{employeeId}/skills/{skillId}")
    public ResponseEntity<Map<String, String>> assignSkill(@PathVariable String employeeId,
                                                           @PathVariable String skillId) {

        service.assignSkill(employeeId, skillId);

        return ResponseEntity.ok(Map.of("message", "Skill assigned successfully."));
    }

    @GetMapping("/{employeeId}/skills")
    public List<Skill> getEmployeeSkills(@PathVariable String employeeId) {

        return service.getEmployeeSkills(employeeId);
    }

    @GetMapping("/skills/{skillId}")
    public List<Employee> getEmployeesBySkill(@PathVariable String skillId) {

        return service.getEmployeesBySkill(skillId);
    }

    @PostMapping("/{employeeId}/projects/{projectId}")
    public ResponseEntity<Map<String, String>> assignProject(
            @PathVariable String employeeId,
            @PathVariable String projectId) {

        service.assignProject(employeeId, projectId);

        return ResponseEntity.ok(Map.of("message", "Project assigned successfully."));
    }
    @GetMapping("/{employeeId}/projects")
    public ResponseEntity<List<Project>> getProjects(
            @PathVariable String employeeId){

        return ResponseEntity.ok(service.getEmployeeProjects(employeeId));
    }

    @GetMapping("/{employeeId}/recommendations")
    public ResponseEntity<List<Recommendation>> recommendations(
            @PathVariable String employeeId){

        return ResponseEntity.ok(service.recommendEmployees(employeeId));
    }
    @PostMapping("/{employeeId}/manager/{managerId}")
    public ResponseEntity<Map<String, String>> assignManager(
            @PathVariable String employeeId,
            @PathVariable String managerId) {

        service.assignManager(employeeId, managerId);

        return ResponseEntity.ok(Map.of("message", "Manager assigned successfully."));
    }

    @GetMapping("/path/{emp1}/{emp2}")
    public ResponseEntity<ReportingPath> shortestPath(
            @PathVariable String emp1,
            @PathVariable String emp2){

        return ResponseEntity.ok(service.shortestPath(emp1,emp2));
    }
}
package com.wexa.backend.controller;

import com.wexa.backend.model.Employee;
import com.wexa.backend.model.Project;
import com.wexa.backend.model.Skill;
import com.wexa.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@CrossOrigin("*")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    public String create(@RequestBody Employee employee) {

        service.save(employee);

        return "Employee Created Successfully";
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
    public String update(@PathVariable String employeeId,
                         @RequestBody Employee employee) {

        employee.setEmployeeId(employeeId);

        service.update(employee);

        return "Employee Updated Successfully";
    }

    @DeleteMapping("/{employeeId}")
    public String delete(@PathVariable String employeeId) {

        service.delete(employeeId);

        return "Employee Deleted Successfully";
    }

    @PostMapping("/{employeeId}/skills/{skillId}")
    public String assignSkill(@PathVariable String employeeId,
                              @PathVariable String skillId) {

        service.assignSkill(employeeId, skillId);

        return "Skill assigned successfully.";
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
    public ResponseEntity<String> assignProject(
            @PathVariable String employeeId,
            @PathVariable String projectId) {

        service.assignProject(employeeId, projectId);

        return ResponseEntity.ok("Project assigned successfully.");
    }
    @GetMapping("/{employeeId}/projects")
    public ResponseEntity<List<Project>> getProjects(
            @PathVariable String employeeId){

        return ResponseEntity.ok(service.getEmployeeProjects(employeeId));
    }

    @GetMapping("/{employeeId}/recommendations")
    public ResponseEntity<List<Employee>> recommendations(
            @PathVariable String employeeId){

        return ResponseEntity.ok(service.recommendEmployees(employeeId));
    }
    @PostMapping("/{employeeId}/manager/{managerId}")
    public ResponseEntity<String> assignManager(
            @PathVariable String employeeId,
            @PathVariable String managerId){

        service.assignManager(employeeId,managerId);

        return ResponseEntity.ok("Manager assigned successfully.");
    }

    @GetMapping("/path/{emp1}/{emp2}")
    public ResponseEntity<List<String>> shortestPath(
            @PathVariable String emp1,
            @PathVariable String emp2){

        return ResponseEntity.ok(service.shortestPath(emp1,emp2));
    }
}
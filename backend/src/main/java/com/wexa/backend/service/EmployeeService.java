package com.wexa.backend.service;

import com.wexa.backend.model.Employee;
import com.wexa.backend.model.Project;
import com.wexa.backend.model.Skill;
import com.wexa.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public void save(Employee employee) {
        repository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Employee getEmployee(String employeeId) {
        return repository.findById(employeeId);
    }

    public void update(Employee employee) {
        repository.update(employee);
    }

    public void delete(String employeeId) {
        repository.delete(employeeId);
    }

    public void assignSkill(String employeeId, String skillId) {
        repository.assignSkill(employeeId, skillId);
    }

    public List<Skill> getEmployeeSkills(String employeeId) {
        return repository.getEmployeeSkills(employeeId);
    }

    public List<Employee> getEmployeesBySkill(String skillId) {
        return repository.getEmployeesBySkill(skillId);
    }

    public void assignProject(String employeeId, String projectId) {
        repository.assignProject(employeeId, projectId);
    }
    public List<Project> getEmployeeProjects(String employeeId){
        return repository.getEmployeeProjects(employeeId);
    }

    public List<Employee> recommendEmployees(String employeeId){
        return repository.recommendEmployees(employeeId);
    }

    public void assignManager(String employeeId,String managerId){
        repository.assignManager(employeeId,managerId);
    }
    public List<String> shortestPath(String emp1,String emp2){
        return repository.shortestPath(emp1,emp2);
    }

}
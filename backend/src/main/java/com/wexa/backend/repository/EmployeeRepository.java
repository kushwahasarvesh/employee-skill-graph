package com.wexa.backend.repository;

import com.wexa.backend.model.Employee;
import com.wexa.backend.model.Project;
import com.wexa.backend.model.Skill;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.neo4j.driver.types.Node;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.neo4j.driver.Value;

@Repository
public class EmployeeRepository {

    private final Driver driver;

    public EmployeeRepository(Driver driver) {
        this.driver = driver;
    }

    public void save(Employee employee) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {
                tx.run("""
                        CREATE (e:Employee {
                            employeeId:$employeeId,
                            name:$name,
                            email:$email,
                            designation:$designation
                        })
                        """,
                        Map.of(
                                "employeeId", employee.getEmployeeId(),
                                "name", employee.getName(),
                                "email", employee.getEmail(),
                                "designation", employee.getDesignation()
                        ));
                return null;
            });
        }
    }

    public List<Employee> findAll() {

        List<Employee> employees = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                            MATCH (e:Employee)
                            RETURN e
                            """).list());

            for (Record record : records) {

                var node = record.get("e").asNode();

                employees.add(new Employee(
                        node.get("employeeId").asString(),
                        node.get("name").asString(),
                        node.get("email").asString(),
                        node.get("designation").asString()
                ));
            }
        }

        return employees;
    }

    public Employee findById(String employeeId) {

        try (Session session = driver.session()) {

            Record record = session.executeRead(tx ->
                    tx.run("""
                            MATCH (e:Employee {employeeId:$employeeId})
                            RETURN e
                            """,
                                    Map.of("employeeId", employeeId))
                            .single());

            var node = record.get("e").asNode();

            return new Employee(
                    node.get("employeeId").asString(),
                    node.get("name").asString(),
                    node.get("email").asString(),
                    node.get("designation").asString()
            );
        }
    }

    public void update(Employee employee) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (e:Employee {employeeId:$employeeId})
                        SET e.name=$name,
                            e.email=$email,
                            e.designation=$designation
                        """,
                        Map.of(
                                "employeeId", employee.getEmployeeId(),
                                "name", employee.getName(),
                                "email", employee.getEmail(),
                                "designation", employee.getDesignation()
                        ));

                return null;
            });
        }
    }

    public void delete(String employeeId) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (e:Employee {employeeId:$employeeId})
                        DETACH DELETE e
                        """,
                        Map.of("employeeId", employeeId));

                return null;
            });
        }
    }

    public void assignSkill(String employeeId, String skillId) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                    MATCH (e:Employee {employeeId:$employeeId})
                    MATCH (s:Skill {skillId:$skillId})
                    MERGE (e)-[:HAS_SKILL]->(s)
                    """,
                        Map.of(
                                "employeeId", employeeId,
                                "skillId", skillId
                        ));

                return null;
            });
        }
    }

    public List<Skill> getEmployeeSkills(String employeeId) {

        List<Skill> skills = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                        MATCH (e:Employee {employeeId:$employeeId})
                              -[:HAS_SKILL]->
                              (s:Skill)
                        RETURN s
                        """,
                                    Map.of("employeeId", employeeId))
                            .list());

            for (Record record : records) {

                var node = record.get("s").asNode();

                skills.add(new Skill(
                        node.get("skillId").asString(),
                        node.get("skillName").asString(),
                        node.get("description").asString()
                ));
            }
        }

        return skills;
    }

    public List<Employee> getEmployeesBySkill(String skillId) {

        List<Employee> employees = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                        MATCH (e:Employee)
                              -[:HAS_SKILL]->
                              (s:Skill {skillId:$skillId})
                        RETURN e
                        """,
                                    Map.of("skillId", skillId))
                            .list());

            for (Record record : records) {

                var node = record.get("e").asNode();

                employees.add(new Employee(
                        node.get("employeeId").asString(),
                        node.get("name").asString(),
                        node.get("email").asString(),
                        node.get("designation").asString()
                ));
            }
        }

        return employees;
    }

    public void assignProject(String employeeId, String projectId) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                    MATCH (e:Employee {employeeId:$employeeId})
                    MATCH (p:Project {projectId:$projectId})
                    MERGE (e)-[:WORKED_ON]->(p)
                    """,
                        Map.of(
                                "employeeId", employeeId,
                                "projectId", projectId
                        ));

                return null;
            });
        }
    }

    public List<Project> getEmployeeProjects(String employeeId) {

        List<Project> projects = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                        MATCH (e:Employee {employeeId:$employeeId})
                        -[:WORKED_ON]->
                        (p:Project)

                        RETURN p
                        """,
                                    Map.of("employeeId", employeeId))
                            .list());

            for (Record record : records) {

                Node node = record.get("p").asNode();

                projects.add(new Project(
                        node.get("projectId").asString(),
                        node.get("projectName").asString(),
                        node.get("clientName").asString(),
                        node.get("description").asString()
                ));
            }
        }

        return projects;
    }

    public List<Employee> recommendEmployees(String employeeId){

        List<Employee> employees = new ArrayList<>();

        try(Session session = driver.session()){

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                        MATCH (e:Employee {employeeId:$employeeId})
                        -[:HAS_SKILL]->
                        (s:Skill)
                        <-[:HAS_SKILL]-
                        (other:Employee)

                        WHERE other.employeeId <> $employeeId

                        RETURN DISTINCT other
                        """,
                                    Map.of("employeeId", employeeId))
                            .list());

            for(Record record : records){

                Node node = record.get("other").asNode();

                employees.add(new Employee(
                        node.get("employeeId").asString(),
                        node.get("name").asString(),
                        node.get("email").asString(),
                        node.get("designation").asString()
                ));
            }
        }

        return employees;
    }

    public void assignManager(String employeeId, String managerId){

        try(Session session = driver.session()){

            session.executeWrite(tx -> {

                tx.run("""
                    MATCH (e:Employee {employeeId:$employeeId})
                    MATCH (m:Employee {employeeId:$managerId})

                    MERGE (e)-[:REPORTS_TO]->(m)
                    """,
                        Map.of(
                                "employeeId",employeeId,
                                "managerId",managerId
                        ));

                return null;
            });
        }
    }

    public List<String> shortestPath(String emp1,String emp2){

        List<String> path = new ArrayList<>();

        try(Session session = driver.session()){

            Record record = session.executeRead(tx ->
                    tx.run("""
                        MATCH p = shortestPath(
                        (e1:Employee {employeeId:$emp1})
                        -[:REPORTS_TO*]-
                        (e2:Employee {employeeId:$emp2})
                        )

                        RETURN [node IN nodes(p) | node.employeeId] AS path
                        """,
                                    Map.of(
                                            "emp1",emp1,
                                            "emp2",emp2
                                    ))
                            .single());

            path = record.get("path").asList(Value::asString);
        }

        return path;
    }
}
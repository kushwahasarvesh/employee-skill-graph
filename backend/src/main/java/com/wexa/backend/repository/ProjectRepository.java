package com.wexa.backend.repository;

import com.wexa.backend.model.Project;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ProjectRepository {

    private final Driver driver;

    public ProjectRepository(Driver driver) {
        this.driver = driver;
    }

    public void save(Project project) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {
                tx.run("""
                        CREATE (p:Project {
                            projectId:$projectId,
                            projectName:$projectName,
                            clientName:$clientName,
                            description:$description
                        })
                        """,
                        Map.of(
                                "projectId", project.getProjectId(),
                                "projectName", project.getProjectName(),
                                "clientName", project.getClientName(),
                                "description", project.getDescription()
                        ));
                return null;
            });
        }
    }

    public List<Project> findAll() {

        List<Project> projects = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                            MATCH (p:Project)
                            RETURN p
                            """).list());

            for (Record record : records) {

                var node = record.get("p").asNode();

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

    public Project findById(String projectId) {

        try (Session session = driver.session()) {

            Record record = session.executeRead(tx ->
                    tx.run("""
                            MATCH (p:Project {projectId:$projectId})
                            RETURN p
                            """,
                                    Map.of("projectId", projectId))
                            .single());

            var node = record.get("p").asNode();

            return new Project(
                    node.get("projectId").asString(),
                    node.get("projectName").asString(),
                    node.get("clientName").asString(),
                    node.get("description").asString()
            );
        }
    }

    public void update(Project project) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (p:Project {projectId:$projectId})
                        SET p.projectName=$projectName,
                            p.clientName=$clientName,
                            p.description=$description
                        """,
                        Map.of(
                                "projectId", project.getProjectId(),
                                "projectName", project.getProjectName(),
                                "clientName", project.getClientName(),
                                "description", project.getDescription()
                        ));

                return null;
            });
        }
    }

    public void delete(String projectId) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (p:Project {projectId:$projectId})
                        DETACH DELETE p
                        """,
                        Map.of("projectId", projectId));

                return null;
            });
        }
    }
}
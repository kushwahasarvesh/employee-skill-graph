package com.wexa.backend.repository;

import com.wexa.backend.model.Skill;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class SkillRepository {

    private final Driver driver;

    public SkillRepository(Driver driver) {
        this.driver = driver;
    }

    public void save(Skill skill) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        CREATE (s:Skill {
                            skillId:$skillId,
                            skillName:$skillName,
                            description:$description
                        })
                        """,
                        Map.of(
                                "skillId", skill.getSkillId(),
                                "skillName", skill.getSkillName(),
                                "description", skill.getDescription()
                        ));

                return null;
            });
        }
    }

    public List<Skill> findAll() {

        List<Skill> skills = new ArrayList<>();

        try (Session session = driver.session()) {

            List<Record> records = session.executeRead(tx ->
                    tx.run("""
                            MATCH (s:Skill)
                            RETURN s
                            """).list());

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

    public Skill findById(String skillId) {

        try (Session session = driver.session()) {

            Record record = session.executeRead(tx ->
                    tx.run("""
                            MATCH (s:Skill {skillId:$skillId})
                            RETURN s
                            """,
                                    Map.of("skillId", skillId))
                            .single());

            var node = record.get("s").asNode();

            return new Skill(
                    node.get("skillId").asString(),
                    node.get("skillName").asString(),
                    node.get("description").asString()
            );
        }
    }

    public void update(Skill skill) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (s:Skill {skillId:$skillId})
                        SET s.skillName=$skillName,
                            s.description=$description
                        """,
                        Map.of(
                                "skillId", skill.getSkillId(),
                                "skillName", skill.getSkillName(),
                                "description", skill.getDescription()
                        ));

                return null;
            });
        }
    }

    public void delete(String skillId) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run("""
                        MATCH (s:Skill {skillId:$skillId})
                        DETACH DELETE s
                        """,
                        Map.of("skillId", skillId));

                return null;
            });
        }
    }
}
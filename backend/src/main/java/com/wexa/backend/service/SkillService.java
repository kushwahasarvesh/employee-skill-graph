package com.wexa.backend.service;

import com.wexa.backend.model.Skill;
import com.wexa.backend.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository repository;

    public SkillService(SkillRepository repository) {
        this.repository = repository;
    }

    public void save(Skill skill) {
        repository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return repository.findAll();
    }

    public Skill getSkill(String skillId) {
        return repository.findById(skillId);
    }

    public void update(Skill skill) {
        repository.update(skill);
    }

    public void delete(String skillId) {
        repository.delete(skillId);
    }
}
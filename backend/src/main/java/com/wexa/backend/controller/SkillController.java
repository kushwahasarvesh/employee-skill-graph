package com.wexa.backend.controller;

import com.wexa.backend.model.Skill;
import com.wexa.backend.service.SkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
@CrossOrigin("*")
public class SkillController {

    private final SkillService service;

    public SkillController(SkillService service) {
        this.service = service;
    }

    @PostMapping
    public String create(@RequestBody Skill skill) {

        service.save(skill);

        return "Skill Created Successfully";
    }

    @GetMapping
    public List<Skill> getAll() {
        return service.getAllSkills();
    }

    @GetMapping("/{skillId}")
    public Skill get(@PathVariable String skillId) {
        return service.getSkill(skillId);
    }

    @PutMapping("/{skillId}")
    public String update(@PathVariable String skillId,
                         @RequestBody Skill skill) {

        skill.setSkillId(skillId);

        service.update(skill);

        return "Skill Updated Successfully";
    }

    @DeleteMapping("/{skillId}")
    public String delete(@PathVariable String skillId) {

        service.delete(skillId);

        return "Skill Deleted Successfully";
    }


}
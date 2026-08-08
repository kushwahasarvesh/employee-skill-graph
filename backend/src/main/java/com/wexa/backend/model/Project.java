package com.wexa.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    private String projectId;
    private String projectName;
    private String clientName;
    private String description;
}
package com.wexa.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportingHop {

    /** Employee on the REPORTS_TO start node (the reporter). */
    private String reporterId;

    /** Employee on the REPORTS_TO end node (the manager). */
    private String managerId;
}

package com.wexa.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportingPath {

    /** Employees in shortest-path order (undirected through the org chart). */
    private List<Employee> people;

    /**
     * One hop per consecutive pair in {@code people}.
     * Direction is the stored REPORTS_TO edge, not left-to-right path order.
     */
    private List<ReportingHop> hops;
}

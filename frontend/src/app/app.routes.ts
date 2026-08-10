import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard';
import { EmployeesComponent } from './pages/employees/employees';
import { EmployeeDetailsComponent } from './pages/employee-details/employee-details';
import { SkillsComponent } from './pages/skills/skills';
import { ProjectsComponent } from './pages/projects/projects';
import { Graph } from './pages/graph/graph';
import { RelationshipsComponent } from './pages/relationships/relationships';
import { RecommendationsComponent } from './pages/recommendations/recommendations';
import { ShortestPathComponent } from './pages/shortest-path/shortest-path';


export const routes: Routes = [

    {
        path: '',
        component: DashboardComponent
    },

    {
        path: 'employees',
        component: EmployeesComponent
    },

    {
        path: 'employees/:employeeId',
        component: EmployeeDetailsComponent
    },

    {
        path: 'skills',
        component: SkillsComponent
    },


    {
        path: 'projects',
        component: ProjectsComponent
    },

    {
        path: 'graph',
        component: Graph
    },
    {
        path: 'relationships',
        component: RelationshipsComponent
    },
    {
        path: 'recommendations',
        component: RecommendationsComponent
    },
    {
        path: 'shortest-path',
        component: ShortestPathComponent
    }

];

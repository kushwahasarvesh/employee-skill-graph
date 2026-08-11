import { Employee } from './employee';

export interface ReportingHop {
  reporterId: string;
  managerId: string;
}

export interface ReportingPath {
  people: Employee[];
  hops: ReportingHop[];
}

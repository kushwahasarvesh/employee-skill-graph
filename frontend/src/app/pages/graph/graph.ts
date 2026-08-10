import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { EmployeeService } from '../../services/employee';
import { SkillService } from '../../services/skill';
import { ProjectService } from '../../services/project';
import { Employee } from '../../models/employee';
import { Skill } from '../../models/skill';
import { Project } from '../../models/project';

export type GraphNodeType = 'employee' | 'skill' | 'project';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  subtitle?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: 'skill' | 'project';
}

interface GraphPayload {
  employees: Employee[];
  skills: Skill[];
  projects: Project[];
  skillLinks: { employeeId: string; skillId: string }[];
  projectLinks: { employeeId: string; projectId: string }[];
}

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './graph.html',
  styleUrl: './graph.scss',
})
export class Graph implements OnInit, AfterViewInit, OnDestroy {
  private readonly employeeService = inject(EmployeeService);
  private readonly skillService = inject(SkillService);
  private readonly projectService = inject(ProjectService);

  readonly canvasHost = viewChild<ElementRef<HTMLDivElement>>('canvasHost');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly nodes = signal<GraphNode[]>([]);
  readonly edges = signal<GraphEdge[]>([]);

  readonly showEmployees = signal(true);
  readonly showSkills = signal(true);
  readonly showProjects = signal(true);
  readonly search = signal('');
  readonly selectedId = signal<string | null>(null);

  readonly width = signal(960);
  readonly height = signal(620);
  readonly transform = signal({ x: 0, y: 0, k: 1 });

  readonly employeeCount = computed(() => this.nodes().filter((n) => n.type === 'employee').length);
  readonly skillCount = computed(() => this.nodes().filter((n) => n.type === 'skill').length);
  readonly projectCount = computed(() => this.nodes().filter((n) => n.type === 'project').length);
  readonly linkCount = computed(() => this.edges().length);

  readonly selectedNode = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    return this.nodes().find((n) => n.id === id) ?? null;
  });

  readonly selectedConnections = computed(() => {
    const selected = this.selectedNode();
    if (!selected) {
      return [];
    }
    const nodeMap = new Map(this.nodes().map((n) => [n.id, n]));
    return this.edges()
      .filter((e) => e.source === selected.id || e.target === selected.id)
      .map((e) => {
        const otherId = e.source === selected.id ? e.target : e.source;
        return nodeMap.get(otherId);
      })
      .filter((n): n is GraphNode => !!n);
  });

  readonly visibleNodeIds = computed(() => {
    const q = this.search().trim().toLowerCase();
    const ids = new Set<string>();

    for (const node of this.nodes()) {
      const typeVisible =
        (node.type === 'employee' && this.showEmployees()) ||
        (node.type === 'skill' && this.showSkills()) ||
        (node.type === 'project' && this.showProjects());

      if (!typeVisible) {
        continue;
      }

      if (!q) {
        ids.add(node.id);
        continue;
      }

      const haystack = `${node.label} ${node.subtitle ?? ''} ${node.id}`.toLowerCase();
      if (haystack.includes(q)) {
        ids.add(node.id);
      }
    }

    if (q) {
      for (const edge of this.edges()) {
        if (ids.has(edge.source)) {
          ids.add(edge.target);
        }
        if (ids.has(edge.target)) {
          ids.add(edge.source);
        }
      }
    }

    return ids;
  });

  readonly visibleNodes = computed(() => {
    const ids = this.visibleNodeIds();
    return this.nodes().filter((n) => ids.has(n.id));
  });

  readonly visibleEdges = computed(() => {
    const ids = this.visibleNodeIds();
    return this.edges().filter((e) => ids.has(e.source) && ids.has(e.target));
  });

  readonly renderedEdges = computed(() => {
    const nodeMap = new Map(this.nodes().map((n) => [n.id, n]));
    return this.visibleEdges()
      .map((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) {
          return null;
        }
        return {
          ...edge,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
        };
      })
      .filter((edge): edge is NonNullable<typeof edge> => !!edge);
  });

  readonly highlightedIds = computed(() => {
    const selected = this.selectedId();
    const q = this.search().trim().toLowerCase();
    const set = new Set<string>();

    if (selected) {
      set.add(selected);
      for (const edge of this.edges()) {
        if (edge.source === selected) {
          set.add(edge.target);
        }
        if (edge.target === selected) {
          set.add(edge.source);
        }
      }
    }

    if (q) {
      for (const node of this.nodes()) {
        const haystack = `${node.label} ${node.subtitle ?? ''} ${node.id}`.toLowerCase();
        if (haystack.includes(q)) {
          set.add(node.id);
        }
      }
    }

    return set;
  });

  private animationFrame = 0;
  private running = false;
  private resizeObserver?: ResizeObserver;
  private dragNode: GraphNode | null = null;
  private panning = false;
  private panStart = { x: 0, y: 0 };
  private transformStart = { x: 0, y: 0, k: 1 };
  private pointerId: number | null = null;

  ngOnInit(): void {
    this.loadGraph();
  }

  ngAfterViewInit(): void {
    const host = this.canvasHost()?.nativeElement;
    if (!host || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        this.width.set(Math.floor(width));
        this.height.set(Math.floor(height));
      }
    });
    this.resizeObserver.observe(host);
  }

  ngOnDestroy(): void {
    this.stopSimulation();
    this.resizeObserver?.disconnect();
  }

  loadGraph(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedId.set(null);

    forkJoin({
      employees: this.employeeService.getEmployees().pipe(catchError(() => of([] as Employee[]))),
      skills: this.skillService.getSkills().pipe(catchError(() => of([] as Skill[]))),
      projects: this.projectService.getProjects().pipe(catchError(() => of([] as Project[]))),
    })
      .pipe(
        switchMap(({ employees, skills, projects }) => {
          const list = employees ?? [];
          if (!list.length) {
            return of({
              employees: [],
              skills: skills ?? [],
              projects: projects ?? [],
              skillLinks: [],
              projectLinks: [],
            } satisfies GraphPayload);
          }

          const detailCalls = list.map((employee) =>
            forkJoin({
              skills: this.employeeService.getEmployeeSkills(employee.employeeId).pipe(
                catchError(() => of([] as Skill[]))
              ),
              projects: this.employeeService.getEmployeeProjects(employee.employeeId).pipe(
                catchError(() => of([] as Project[]))
              ),
            }).pipe(
              map(({ skills: empSkills, projects: empProjects }) => ({
                employeeId: employee.employeeId,
                skillIds: (empSkills ?? []).map((s) => s.skillId),
                projectIds: (empProjects ?? []).map((p) => p.projectId),
              }))
            )
          );

          return forkJoin(detailCalls).pipe(
            map((details) => {
              const skillLinks: GraphPayload['skillLinks'] = [];
              const projectLinks: GraphPayload['projectLinks'] = [];

              for (const detail of details) {
                for (const skillId of detail.skillIds) {
                  skillLinks.push({ employeeId: detail.employeeId, skillId });
                }
                for (const projectId of detail.projectIds) {
                  projectLinks.push({ employeeId: detail.employeeId, projectId });
                }
              }

              return {
                employees: list,
                skills: skills ?? [],
                projects: projects ?? [],
                skillLinks,
                projectLinks,
              } satisfies GraphPayload;
            })
          );
        })
      )
      .subscribe({
        next: (payload) => {
          this.buildGraph(payload);
          this.loading.set(false);
          this.startSimulation();
        },
        error: (err) => {
          console.error(err);
          this.error.set('Unable to load the skill graph. Check that the API is running.');
          this.loading.set(false);
        },
      });
  }

  onSearchInput(value: string): void {
    this.search.set(value);
  }

  toggleType(type: GraphNodeType): void {
    if (type === 'employee') {
      this.showEmployees.update((v) => !v);
    } else if (type === 'skill') {
      this.showSkills.update((v) => !v);
    } else {
      this.showProjects.update((v) => !v);
    }
  }

  selectNode(node: GraphNode, event?: Event): void {
    event?.stopPropagation();
    this.selectedId.set(this.selectedId() === node.id ? null : node.id);
  }

  clearSelection(): void {
    this.selectedId.set(null);
  }

  resetView(): void {
    this.transform.set({ x: 0, y: 0, k: 1 });
    this.reseedPositions();
    this.startSimulation();
  }

  zoomIn(): void {
    this.zoomBy(1.18);
  }

  zoomOut(): void {
    this.zoomBy(1 / 1.18);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
    this.zoomBy(factor, event.offsetX, event.offsetY);
  }

  onPointerDown(event: PointerEvent): void {
    const target = event.target as Element | null;
    const nodeId = target?.closest?.('[data-node-id]')?.getAttribute('data-node-id');

    if (nodeId) {
      const node = this.nodes().find((n) => n.id === nodeId) ?? null;
      this.dragNode = node;
      this.pointerId = event.pointerId;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      if (node) {
        this.selectedId.set(node.id);
      }
      return;
    }

    this.panning = true;
    this.pointerId = event.pointerId;
    this.panStart = { x: event.clientX, y: event.clientY };
    this.transformStart = { ...this.transform() };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }

    if (this.dragNode) {
      const t = this.transform();
      const host = this.canvasHost()?.nativeElement;
      if (!host) {
        return;
      }
      const rect = host.getBoundingClientRect();
      const x = (event.clientX - rect.left - t.x) / t.k;
      const y = (event.clientY - rect.top - t.y) / t.k;
      this.dragNode.x = x;
      this.dragNode.y = y;
      this.dragNode.vx = 0;
      this.dragNode.vy = 0;
      this.nodes.set([...this.nodes()]);
      return;
    }

    if (this.panning) {
      const dx = event.clientX - this.panStart.x;
      const dy = event.clientY - this.panStart.y;
      this.transform.set({
        x: this.transformStart.x + dx,
        y: this.transformStart.y + dy,
        k: this.transformStart.k,
      });
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }
    this.dragNode = null;
    this.panning = false;
    this.pointerId = null;
  }

  nodeFill(type: GraphNodeType): string {
    if (type === 'employee') {
      return '#2f9e8a';
    }
    if (type === 'skill') {
      return '#2f6fed';
    }
    return '#d96b4c';
  }

  nodeInitials(label: string): string {
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  shortLabel(label: string, max = 18): string {
    if (label.length <= max) {
      return label;
    }
    return `${label.slice(0, max - 1)}…`;
  }

  isDimmed(nodeId: string): boolean {
    const highlight = this.highlightedIds();
    if (!highlight.size) {
      return false;
    }
    return !highlight.has(nodeId);
  }

  isEdgeActive(edge: GraphEdge): boolean {
    const selected = this.selectedId();
    if (!selected) {
      return false;
    }
    return edge.source === selected || edge.target === selected;
  }

  trackNode(_: number, node: GraphNode): string {
    return node.id;
  }

  trackEdge(_: number, edge: GraphEdge): string {
    return edge.id;
  }

  private buildGraph(payload: GraphPayload): void {
    const w = this.width();
    const h = this.height();
    const cx = w / 2;
    const cy = h / 2;

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const skillIds = new Set(payload.skills.map((s) => s.skillId));
    const projectIds = new Set(payload.projects.map((p) => p.projectId));

    payload.employees.forEach((employee, index) => {
      const angle = (index / Math.max(payload.employees.length, 1)) * Math.PI * 2;
      nodes.push({
        id: `e:${employee.employeeId}`,
        label: employee.name,
        type: 'employee',
        subtitle: employee.designation || employee.employeeId,
        x: cx + Math.cos(angle) * 150 + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * 110 + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: 18,
      });
    });

    payload.skills.forEach((skill, index) => {
      const angle = (index / Math.max(payload.skills.length, 1)) * Math.PI * 2;
      nodes.push({
        id: `s:${skill.skillId}`,
        label: skill.skillName,
        type: 'skill',
        subtitle: skill.skillId,
        x: cx + Math.cos(angle) * 240 + (Math.random() - 0.5) * 50,
        y: cy + Math.sin(angle) * 180 + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        radius: 14,
      });
    });

    payload.projects.forEach((project, index) => {
      const angle = (index / Math.max(payload.projects.length, 1)) * Math.PI * 2 + 0.4;
      nodes.push({
        id: `p:${project.projectId}`,
        label: project.projectName,
        type: 'project',
        subtitle: project.clientName || project.projectId,
        x: cx + Math.cos(angle) * 280 + (Math.random() - 0.5) * 50,
        y: cy + Math.sin(angle) * 200 + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        radius: 15,
      });
    });

    for (const link of payload.skillLinks) {
      if (!skillIds.has(link.skillId)) {
        continue;
      }
      edges.push({
        id: `es:${link.employeeId}:${link.skillId}`,
        source: `e:${link.employeeId}`,
        target: `s:${link.skillId}`,
        kind: 'skill',
      });
    }

    for (const link of payload.projectLinks) {
      if (!projectIds.has(link.projectId)) {
        continue;
      }
      edges.push({
        id: `ep:${link.employeeId}:${link.projectId}`,
        source: `e:${link.employeeId}`,
        target: `p:${link.projectId}`,
        kind: 'project',
      });
    }

    this.nodes.set(nodes);
    this.edges.set(edges);
  }

  private reseedPositions(): void {
    const w = this.width();
    const h = this.height();
    const cx = w / 2;
    const cy = h / 2;
    const next = this.nodes().map((node, index) => {
      const angle = (index / Math.max(this.nodes().length, 1)) * Math.PI * 2;
      const ring = node.type === 'employee' ? 140 : node.type === 'skill' ? 230 : 280;
      return {
        ...node,
        x: cx + Math.cos(angle) * ring + (Math.random() - 0.5) * 30,
        y: cy + Math.sin(angle) * (ring * 0.72) + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
      };
    });
    this.nodes.set(next);
  }

  private zoomBy(factor: number, originX?: number, originY?: number): void {
    const t = this.transform();
    const nextK = Math.min(2.8, Math.max(0.35, t.k * factor));
    const ox = originX ?? this.width() / 2;
    const oy = originY ?? this.height() / 2;
    const nextX = ox - ((ox - t.x) * nextK) / t.k;
    const nextY = oy - ((oy - t.y) * nextK) / t.k;
    this.transform.set({ x: nextX, y: nextY, k: nextK });
  }

  private startSimulation(): void {
    if (typeof requestAnimationFrame === 'undefined') {
      return;
    }

    this.stopSimulation();
    this.running = true;
    let ticks = 0;

    const step = () => {
      if (!this.running) {
        return;
      }
      this.tick();
      ticks += 1;
      if (ticks < 220 || this.dragNode) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.running = false;
      }
    };

    this.animationFrame = requestAnimationFrame(step);
  }

  private stopSimulation(): void {
    this.running = false;
    if (this.animationFrame && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  private tick(): void {
    const nodes = this.nodes();
    if (!nodes.length) {
      return;
    }

    const edges = this.edges();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const alpha = 0.08;
    const centerX = this.width() / 2;
    const centerY = this.height() / 2;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy) || 0.01;
        const minDist = a.radius + b.radius + 28;
        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.08;
          dx *= force;
          dy *= force;
          if (a !== this.dragNode) {
            a.vx -= dx;
            a.vy -= dy;
          }
          if (b !== this.dragNode) {
            b.vx += dx;
            b.vy += dy;
          }
        } else {
          const force = 420 / (dist * dist);
          dx = (dx / dist) * force;
          dy = (dy / dist) * force;
          if (a !== this.dragNode) {
            a.vx -= dx;
            a.vy -= dy;
          }
          if (b !== this.dragNode) {
            b.vx += dx;
            b.vy += dy;
          }
        }
      }
    }

    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) {
        continue;
      }
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const ideal = edge.kind === 'skill' ? 120 : 140;
      const force = ((dist - ideal) / dist) * 0.035;
      const fx = dx * force;
      const fy = dy * force;
      if (source !== this.dragNode) {
        source.vx += fx;
        source.vy += fy;
      }
      if (target !== this.dragNode) {
        target.vx -= fx;
        target.vy -= fy;
      }
    }

    for (const node of nodes) {
      if (node === this.dragNode) {
        continue;
      }
      node.vx += (centerX - node.x) * 0.004;
      node.vy += (centerY - node.y) * 0.004;
      node.vx *= 0.86;
      node.vy *= 0.86;
      node.x += node.vx * alpha * 12;
      node.y += node.vy * alpha * 12;
      node.x = Math.max(28, Math.min(this.width() - 28, node.x));
      node.y = Math.max(28, Math.min(this.height() - 28, node.y));
    }

    this.nodes.set([...nodes]);
  }
}

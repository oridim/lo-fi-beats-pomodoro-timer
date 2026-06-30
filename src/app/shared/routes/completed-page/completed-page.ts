import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LucideHouse, LucideTrash } from "@lucide/angular";
import { map, Observable } from "rxjs";

import { TasksService } from "../../services/tasks-service";
import { Task } from "../../types/task";

import { PageContainer } from "../../components/page-container/page-container";
import { PageHeader } from "../../components/page-header/page-header";
import { PageTitle } from "../../components/page-title/page-title";
import { PageFooter } from "../../components/page-footer/page-footer";
import { ActionButton } from "../../components/action-button/action-button";
import { ControlGroup } from "../../components/control-group/control-group";
import { ScrollList } from "../../components/scroll-list/scroll-list";
import { TaskTile } from "../../components/task-tile/task-tile";

@Component({
  selector: "completed-page",
  imports: [
    LucideHouse,
    LucideTrash,
    AsyncPipe,
    ActionButton,
    ControlGroup,
    PageContainer,
    PageHeader,
    PageTitle,
    PageFooter,
    ScrollList,
    TaskTile,
  ],
  templateUrl: "./completed-page.html",
  styleUrl: "./completed-page.css",
})
export class CompletedPage {
  readonly tasks$: Observable<Task[]>;

  constructor(readonly tasksService: TasksService) {
    this.tasks$ = tasksService.tasks$.pipe(
      map((tasks) =>
        tasks.slice().sort((taskA, taskB) => {
          return taskB.createdAt - taskA.createdAt;
        })
      ),
      takeUntilDestroyed(),
    );
  }

  onClearClick(_event: MouseEvent): void {
    this.tasksService.clearTasks();
  }
}

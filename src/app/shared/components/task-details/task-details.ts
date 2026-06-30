import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { Observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs";

import { TaskService } from "../../services/task-service";
import { TASK_DURATION } from "../../utils/task";

import { PageTitle } from "../page-title/page-title";
import { PageSubTitle } from "../page-sub-title/page-sub-title";

@Component({
  selector: "task-details",
  imports: [AsyncPipe, PageSubTitle, PageTitle],
  templateUrl: "./task-details.html",
  styleUrl: "./task-details.css",
})
export class TaskDetails {
  readonly durationRemaining$: Observable<string>;

  readonly taskTitle$: Observable<string | null>;

  constructor(private readonly taskService: TaskService) {
    const { durationRemaining$, task$ } = taskService;

    const dateTimeFormat = new Intl.DateTimeFormat(navigator.language, {
      minute: "2-digit",
      second: "2-digit",
    });

    this.durationRemaining$ = durationRemaining$.pipe(
      map((durationRemaining) =>
        durationRemaining
          ? dateTimeFormat.format(durationRemaining)
          : dateTimeFormat.format(TASK_DURATION)
      ),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    );

    this.taskTitle$ = task$.pipe(
      map((task) => task?.title ?? null),
      takeUntilDestroyed(),
    );
  }
}

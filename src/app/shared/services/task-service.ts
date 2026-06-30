import { DestroyRef, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { Observable } from "rxjs";
import {
  BehaviorSubject,
  distinctUntilChanged,
  interval,
  Subject,
  takeUntil,
  timer,
} from "rxjs";

import type { Task } from "../types/task";

export const TASK_STATE = {
  NOT_STARTED: "STATE_NOT_STARTED",

  STARTED: "STATE_STARTED",

  FINISHED: "STATE_FINISHED",
} as const;

export type TaskState = (typeof TASK_STATE)[keyof typeof TASK_STATE];

@Injectable()
export class TaskService {
  private readonly clearTimer: Subject<void> = new Subject<void>();

  private readonly durationRemaining: BehaviorSubject<number | null> =
    new BehaviorSubject<
      number | null
    >(null);

  private readonly endTimestamp: BehaviorSubject<number | null> =
    new BehaviorSubject<
      number | null
    >(null);

  private readonly startTimestamp: BehaviorSubject<number | null> =
    new BehaviorSubject<
      number | null
    >(null);

  private readonly task: BehaviorSubject<Task | null> = new BehaviorSubject<
    Task | null
  >(null);

  private readonly taskState: BehaviorSubject<TaskState> = new BehaviorSubject<
    TaskState
  >(
    TASK_STATE.NOT_STARTED,
  );

  readonly durationRemaining$: Observable<number | null> = this
    .durationRemaining.pipe(distinctUntilChanged());

  readonly endTimestamp$: Observable<number | null> = this.endTimestamp
    .asObservable();

  readonly startTimestamp$: Observable<number | null> = this.startTimestamp
    .asObservable();

  readonly task$: Observable<Task | null> = this.task.asObservable();

  readonly taskState$: Observable<TaskState> = this.taskState.pipe(
    distinctUntilChanged(),
  );

  constructor(private destroyRef: DestroyRef) {}

  finishTask(): void {
    const { clearTimer, endTimestamp, startTimestamp, taskState } = this;

    clearTimer.next();

    endTimestamp.next(null);
    startTimestamp.next(null);

    taskState.next(TASK_STATE.FINISHED);
  }

  startTask(duration: number): void {
    const {
      clearTimer,
      destroyRef,
      durationRemaining,
      endTimestamp,
      startTimestamp,
      taskState,
    } = this;

    const startTimestampValue = Date.now();
    const endTimestampValue = startTimestampValue + duration;

    endTimestamp.next(endTimestampValue);
    startTimestamp.next(startTimestampValue);

    taskState.next(TASK_STATE.STARTED);

    timer(duration)
      .pipe(takeUntil(clearTimer), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.finishTask();
      });

    interval(250)
      .pipe(takeUntil(clearTimer), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        const currentTimestamp = Date.now();

        durationRemaining.next(
          Math.max(endTimestampValue - currentTimestamp, 0),
        );
      });
  }

  updateTask(taskValue: Task | null): void {
    const { task, taskState } = this;

    task.next(taskValue);
    taskState.next(TASK_STATE.NOT_STARTED);
  }
}

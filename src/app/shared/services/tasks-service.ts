import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import type { Observable } from "rxjs";
import { map, shareReplay, startWith } from "rxjs";

import type { Task } from "../types/task";

@Injectable()
export class TasksService {
  private storage: LocalStorageService = inject(LocalStorageService);

  tasks$: Observable<readonly Task[]> = this.storage.observe("tasks").pipe(
    startWith(this.storage.retrieve("tasks")),
    map((tasks) => tasks ?? []),
    shareReplay(1),
  );

  clearTasks(): void {
    this.storage.clear("tasks");
  }

  getTask(uuid: string): Task | null {
    const { storage } = this;
    const tasks = storage.retrieve("tasks");

    if (!tasks) {
      return null;
    }

    return (tasks as Task[]).find((task) => task.uuid === uuid) ?? null;
  }

  pushTask(title: string): Task {
    const { storage } = this;
    const tasks = (storage.retrieve("tasks") ?? []) as Task[];

    const task = {
      title,
      createdAt: Date.now(),
      isCompleted: false,
      uuid: crypto.randomUUID(),
    } satisfies Task;

    storage.store("tasks", [...tasks, task]);
    return task;
  }

  removeTask(uuid: string): void {
    const { storage } = this;
    const tasks = (storage.retrieve("tasks") ?? []) as Task[];

    if (!tasks) {
      return;
    }

    storage.store(
      "tasks",
      tasks.filter((task) => task.uuid !== uuid),
    );
  }

  updateTask(uuid: string, properties: Pick<Task, "isCompleted">): void {
    const { storage } = this;
    const tasks = (storage.retrieve("tasks") ?? []) as Task[];

    if (!tasks) {
      return;
    }

    storage.store(
      "tasks",
      tasks.map((task) => {
        if (task.uuid !== uuid) {
          return task;
        }

        return {
          ...task,
          ...properties,
        };
      }),
    );
  }
}

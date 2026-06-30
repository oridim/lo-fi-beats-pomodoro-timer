import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { TasksService } from "../services/tasks-service";
import { Task } from "../types/task";

export const taskResolver = (async (route, _state) => {
  const tasksService = inject(TasksService);
  const uuid = route.paramMap.get("uuid")!;

  // HACK: We are trusting that the end-user never tries to manipulate the URL or
  // storage on their own... hurray no error checking!
  return tasksService.getTask(uuid)!;
}) satisfies ResolveFn<Task>;

import { Component, Input } from "@angular/core";
import { LucideCircleCheck, LucideCircleX, LucideTrash } from "@lucide/angular";

import { TasksService } from "../../services/tasks-service";
import { Task } from "../../types/task";

import { TextButton } from "../text-button/text-button";

@Component({
  selector: "task-tile",
  imports: [LucideCircleCheck, LucideCircleX, LucideTrash, TextButton],
  templateUrl: "./task-tile.html",
  styleUrl: "./task-tile.css",
})
export class TaskTile {
  @Input({ required: true })
  task!: Task;

  constructor(private readonly tasksService: TasksService) {}

  onClearClick(_event: MouseEvent): void {
    const { task, tasksService } = this;

    tasksService.removeTask(task.uuid);
  }
}

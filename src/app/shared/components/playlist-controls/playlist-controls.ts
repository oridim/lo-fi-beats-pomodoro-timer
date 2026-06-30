import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LucideCheckCheck, LucideSkipForward, LucideX } from "@lucide/angular";
import type { Observable } from "rxjs";
import { firstValueFrom } from "rxjs";

import { PlaylistService } from "../../services/playlist-service";
import { TasksService } from "../../services/tasks-service";
import { TaskService } from "../../services/task-service";

import { ControlGroup } from "../../components/control-group/control-group";
import { TextButton } from "../../components/text-button/text-button";

@Component({
  selector: "playlist-controls",
  imports: [
    AsyncPipe,
    LucideCheckCheck,
    LucideSkipForward,
    LucideX,
    ControlGroup,
    TextButton,
  ],
  templateUrl: "./playlist-controls.html",
  styleUrl: "./playlist-controls.css",
})
export class PlaylistControls {
  readonly isPlaying$: Observable<boolean>;

  constructor(
    readonly playlistService: PlaylistService,
    readonly router: Router,
    readonly taskService: TaskService,
    readonly tasksService: TasksService,
  ) {
    this.isPlaying$ = playlistService.isTrackAudioPlaying$.pipe(
      takeUntilDestroyed(),
    );
  }

  async onMarkCompletedClick(_event: MouseEvent): Promise<void> {
    const { router, taskService, tasksService } = this;
    const task = await firstValueFrom(taskService.task$);

    if (!task) {
      return;
    }

    tasksService.updateTask(task.uuid, {
      isCompleted: true,
    });

    await router.navigate(["completed"]);
  }

  async onSkipClick(_event: MouseEvent): Promise<void> {
    const selectedTrackAudio = await firstValueFrom(
      this.playlistService.selectedTrackAudio$,
    );

    selectedTrackAudio?.stop();
  }
}

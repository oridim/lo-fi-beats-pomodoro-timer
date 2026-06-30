import type { OnInit } from "@angular/core";
import {
  afterNextRender,
  Component,
  DestroyRef,
  Injector,
  Input,
} from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { combineLatest, filter, timer } from "rxjs";

import {
  PLAYLIST_STATE,
  PlaylistService,
} from "../../services/playlist-service";
import { TASK_STATE, TaskService } from "../../services/task-service";
import type { Task } from "../../types/task";
import type { Track } from "../../types/tracks";
import { TASK_DURATION } from "../../utils/task";

import { NowPlaying } from "../../components/now-playing/now-playing";
import { PageContainer } from "../../components/page-container/page-container";
import { PageFooter } from "../../components/page-footer/page-footer";
import { PageHeader } from "../../components/page-header/page-header";
import { PlaylistCarousel } from "../../components/playlist-carousel/playlist-carousel";
import { PlaylistControls } from "../../components/playlist-controls/playlist-controls";
import { TaskDetails } from "../../components/task-details/task-details";

@Component({
  selector: "task-page",
  imports: [
    NowPlaying,
    PageContainer,
    PageFooter,
    PageHeader,
    PlaylistCarousel,
    PlaylistControls,
    TaskDetails,
  ],
  providers: [PlaylistService, TaskService],
  templateUrl: "./task-page.html",
  styleUrl: "./task-page.css",
})
export class TaskPage implements OnInit {
  @Input({ required: true })
  private readonly task!: Task;

  @Input({ required: true })
  private readonly tracks!: Track[];

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly injector: Injector,
    private readonly playlistService: PlaylistService,
    private readonly router: Router,
    private readonly taskService: TaskService,
  ) {}

  ngOnInit(): void {
    const {
      destroyRef,
      injector,
      playlistService,
      router,
      taskService,
      task,
      tracks,
    } = this;

    playlistService.updateTracks(tracks);
    taskService.updateTask(task);

    combineLatest([playlistService.playlistState$, taskService.taskState$])
      .pipe(
        filter(
          ([playlistState, taskState]) =>
            playlistState === PLAYLIST_STATE.PLAYLIST_END ||
            taskState === TASK_STATE.FINISHED,
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(async () => {
        await router.navigate(["completed"]);
      });

    afterNextRender(
      () => {
        timer(1500)
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe(() => {
            taskService.startTask(TASK_DURATION);
            playlistService.updateSelectedTrackIndex(0);
          });
      },
      { injector },
    );
  }
}

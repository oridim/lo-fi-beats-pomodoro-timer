import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import type { Observable } from "rxjs";
import { map } from "rxjs";

import {
  PLAYLIST_STATE,
  PlaylistService,
} from "../../services/playlist-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "now-playing",
  imports: [AsyncPipe],
  templateUrl: "./now-playing.html",
  styleUrl: "./now-playing.css",
})
export class NowPlaying {
  readonly isPlaying$: Observable<boolean>;

  readonly trackTitle$: Observable<string | null>;

  constructor(readonly playlistService: PlaylistService) {
    const { playlistState$, selectedTrack$ } = playlistService;

    this.isPlaying$ = playlistState$.pipe(
      map((playlistState) => {
        switch (playlistState) {
          case PLAYLIST_STATE.TRACK_STARTING:
          case PLAYLIST_STATE.TRACK_STARTED:
          case PLAYLIST_STATE.TRACK_PLAYING:
            return true;
        }

        return false;
      }),
      takeUntilDestroyed(),
    );

    this.trackTitle$ = selectedTrack$.pipe(
      map((selectedTrack) => {
        return selectedTrack?.trackTitle ?? null;
      }),
      takeUntilDestroyed(),
    );
  }
}

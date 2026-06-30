import { AsyncPipe } from "@angular/common";
import type { OnDestroy, OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Howl } from "howler";
import type { Observable } from "rxjs";
import { combineLatest, firstValueFrom, map } from "rxjs";

import {
  PLAYLIST_STATE,
  PlaylistService,
} from "../../services/playlist-service";
import type { Track } from "../../types/tracks";

import { RecordPlayer } from "../record-player/record-player";
import { preload } from "../../utils/howler";

const audioFlipIn: Howl = new Howl({
  src: ["/audio/ui/track-cover-flip-in.mp3"],
  preload: false,
});

const audioFlipOut: Howl = new Howl({
  src: ["/audio/ui/track-cover-flip-out.mp3"],
  preload: false,
});

@Component({
  selector: "track-cover",
  imports: [AsyncPipe, RecordPlayer],
  templateUrl: "./track-cover.html",
  styleUrl: "./track-cover.css",
})
export class TrackCover implements OnDestroy, OnInit {
  readonly isFlipped: Observable<boolean>;

  @Input({ required: true })
  track!: Track;

  constructor(private readonly playlistService: PlaylistService) {
    this.isFlipped = combineLatest([
      playlistService.playlistState$,
      playlistService.selectedTrack$,
    ]).pipe(
      map(([playlistState, track]) => {
        switch (playlistState) {
          case PLAYLIST_STATE.TRACK_ENDING:
          case PLAYLIST_STATE.TRACK_FLIPPING_IN:
          case PLAYLIST_STATE.TRACK_FLIPPED_IN:
          case PLAYLIST_STATE.TRACK_PLAYING:
          case PLAYLIST_STATE.TRACK_STARTED:
          case PLAYLIST_STATE.TRACK_STARTING:
          case PLAYLIST_STATE.TRACK_SWITCHED:
            return this.track === track;
        }

        return false;
      }),
      takeUntilDestroyed(),
    );
  }

  ngOnInit(): void {
    preload(audioFlipIn);
    preload(audioFlipOut);
  }

  ngOnDestroy(): void {
    audioFlipIn.stop();
    audioFlipOut.stop();
  }

  async onTransitionEnd(event: TransitionEvent): Promise<void> {
    if (event.propertyName !== "transform") {
      return;
    }

    const isFlipped = await firstValueFrom(this.isFlipped);

    if (isFlipped) {
      this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_FLIPPED_IN);
    } else {
      this.playlistService.updatePlaylistState(
        PLAYLIST_STATE.TRACK_FLIPPED_OUT,
      );
    }
  }

  async onTransitionStart(event: TransitionEvent): Promise<void> {
    if (event.propertyName !== "transform") {
      return;
    }

    const isFlipped = await firstValueFrom(this.isFlipped);

    if (isFlipped) {
      audioFlipIn.play();
      this.playlistService.updatePlaylistState(
        PLAYLIST_STATE.TRACK_FLIPPING_IN,
      );
    } else {
      audioFlipOut.play();
      this.playlistService.updatePlaylistState(
        PLAYLIST_STATE.TRACK_FLIPPING_OUT,
      );
    }
  }
}

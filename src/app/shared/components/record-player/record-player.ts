import { AsyncPipe } from "@angular/common";
import type { OnDestroy, OnInit } from "@angular/core";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Howl } from "howler";
import type { Observable } from "rxjs";
import { combineLatest, firstValueFrom, map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import {
  PLAYLIST_STATE,
  PlaylistService,
} from "../../services/playlist-service";
import type { Track } from "../../types/tracks";
import { preload } from "../../utils/howler";

const audioNeedleDrop: Howl = new Howl({
  src: ["/audio/ui/record-player-needle-drop.mp3"],
  preload: false,
});

const audioNeedleLift: Howl = new Howl({
  src: ["/audio/ui/record-player-needle-lift.mp3"],
  preload: false,
});

const audioRecordStarting: Howl = new Howl({
  src: ["/audio/ui/record-player-record-starting.mp3"],
  preload: false,
});

@Component({
  selector: "record-player",
  imports: [AsyncPipe],
  templateUrl: "./record-player.html",
  styleUrl: "./record-player.css",
})
export class RecordPlayer implements OnDestroy, OnInit {
  @ViewChild("platter")
  private readonly platterRef!: ElementRef<HTMLDivElement>;

  readonly isPlaying$: Observable<boolean>;

  readonly trackAudioProgression$: Observable<number>;

  @Input({ required: true })
  track!: Track;

  constructor(private readonly playlistService: PlaylistService) {
    const {
      isTrackAudioPlaying$,
      playlistState$,
      selectedTrack$,
      selectedTrackAudio$,
      trackAudioProgression$,
    } = playlistService;

    this.isPlaying$ = combineLatest([
      playlistState$,
      selectedTrack$,
      isTrackAudioPlaying$,
    ]).pipe(
      map(([playlistState, track, isTrackAudioPlaying]) => {
        switch (playlistState) {
          case PLAYLIST_STATE.TRACK_FLIPPED_IN:
          case PLAYLIST_STATE.TRACK_STARTING:
          case PLAYLIST_STATE.TRACK_STARTED:
            return this.track === track;

          case PLAYLIST_STATE.TRACK_PLAYING:
            return this.track === track && isTrackAudioPlaying;
        }

        return false;
      }),
      takeUntilDestroyed(),
    );

    this.trackAudioProgression$ = combineLatest([
      playlistState$,
      selectedTrackAudio$,
      trackAudioProgression$,
    ]).pipe(
      map(([playlistState, selectedTrackAudio, trackAudioProgression]) => {
        switch (playlistState) {
          case PLAYLIST_STATE.TRACK_SWITCHING:
          case PLAYLIST_STATE.TRACK_SWITCHED:
          case PLAYLIST_STATE.TRACK_FLIPPING_IN:
          case PLAYLIST_STATE.TRACK_FLIPPED_IN:
          case PLAYLIST_STATE.TRACK_STARTING:
          case PLAYLIST_STATE.TRACK_STARTED:
            return 0;

          case PLAYLIST_STATE.TRACK_PLAYING:
            return selectedTrackAudio?.playing() ? trackAudioProgression : 1;
        }

        return 1;
      }),
    );
  }

  ngOnInit(): void {
    preload(audioNeedleDrop);
    preload(audioNeedleLift);
    preload(audioRecordStarting);
  }

  ngOnDestroy(): void {
    audioNeedleDrop.stop();
    audioNeedleLift.stop();
    audioRecordStarting.stop();
  }

  switchAnimation(
    animationName: "spin-down" | "spin-infinite" | "spin-up",
  ): void {
    const { nativeElement: platterElement } = this.platterRef;
    const computedStyle = getComputedStyle(platterElement);

    const platterAngle = computedStyle.getPropertyValue(
      "--record-player-platter-angle",
    );
    const glowIntensity = computedStyle.getPropertyValue(
      "--record-player-glow-intensity",
    );
    const morphProgression = computedStyle.getPropertyValue(
      "--record-player-morph-progression",
    );

    platterElement.style.setProperty(
      "--record-player-persisted-platter-angle",
      platterAngle,
    );
    platterElement.style.setProperty(
      "--record-player-persisted-glow-intensity",
      glowIntensity,
    );
    platterElement.style.setProperty(
      "--record-player-persisted-morph-progression",
      morphProgression,
    );

    platterElement.removeAttribute("data-animation");
    void platterElement.offsetWidth;
    platterElement.setAttribute("data-animation", animationName);
  }

  onAnimationStart(event: AnimationEvent): void {
    const { animationName } = event;

    if (animationName.includes("spin-down")) {
      audioNeedleDrop.stop();
      audioRecordStarting.stop();

      audioNeedleLift.play();
      this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_ENDING);
    } else if (animationName.includes("spin-infinite")) {
      audioRecordStarting.play();
    }
  }

  onAnimationEnd(event: AnimationEvent): void {
    const { animationName } = event;

    if (animationName.includes("spin-down")) {
      this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_ENDED);
    } else if (animationName.includes("spin-up")) {
      this.switchAnimation("spin-infinite");
      this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_STARTED);
    }
  }

  async onTransitionEnd(event: TransitionEvent): Promise<void> {
    const isPlaying = await firstValueFrom(this.isPlaying$);

    if (event.propertyName !== "--record-player-arm-angle" || !isPlaying) {
      return;
    }

    this.switchAnimation("spin-up");
  }

  async onTransitionStart(event: TransitionEvent): Promise<void> {
    if (event.propertyName !== "--record-player-arm-angle") {
      return;
    }

    const isPlaying = await firstValueFrom(this.isPlaying$);

    if (isPlaying) {
      audioNeedleDrop.play();
      this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_STARTING);
    } else {
      this.switchAnimation("spin-down");
    }
  }
}

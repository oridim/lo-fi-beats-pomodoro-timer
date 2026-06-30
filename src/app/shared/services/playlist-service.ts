import type { OnDestroy } from "@angular/core";
import { Injectable } from "@angular/core";
import { Howl } from "howler";
import {
  BehaviorSubject,
  combineLatest,
  delay,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  interval,
  map,
  Observable,
  scan,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs";

import type { Track } from "../types/tracks";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

// TODO: Split audio playback stuff into a `PlaybackService`.

export const PLAYLIST_STATE = {
  PLAYLIST_START: "STATE_PLAYLIST_START",

  TRACK_SWITCHING: "STATE_TRACK_SWITCHING",

  TRACK_SWITCHED: "STATE_TRACK_SWITCHED",

  TRACK_FLIPPING_IN: "STATE_TRACK_FLIPPING_IN",

  TRACK_FLIPPED_IN: "STATE_TRACK_FLIPPED_IN",

  TRACK_STARTING: "STATE_TRACK_STARTING",

  TRACK_STARTED: "STATE_TRACK_STARTED",

  TRACK_PLAYING: "STATE_TRACK_PLAYING",

  TRACK_ENDING: "STATE_TRACK_ENDING",

  TRACK_ENDED: "STATE_TRACK_ENDED",

  TRACK_FLIPPING_OUT: "STATE_TRACK_FLIPPING_OUT",

  TRACK_FLIPPED_OUT: "STATE_TRACK_FLIPPED_OUT",

  PLAYLIST_END: "STATE_PLAYLIST_END",
} as const;

export type PlaylistState =
  (typeof PLAYLIST_STATE)[keyof typeof PLAYLIST_STATE];

@Injectable()
export class PlaylistService implements OnDestroy {
  private readonly playlistState: BehaviorSubject<PlaylistState> =
    new BehaviorSubject<PlaylistState>(PLAYLIST_STATE.PLAYLIST_START);

  private readonly tracks: BehaviorSubject<Track[]> = new BehaviorSubject<
    Track[]
  >([]);

  private readonly selectedTrackIndex: BehaviorSubject<number> =
    new BehaviorSubject<number>(-1);

  readonly playlistState$: Observable<PlaylistState> = this.playlistState.pipe(
    distinctUntilChanged(),
  );

  readonly tracks$: Observable<Track[]> = this.tracks.asObservable();

  readonly selectedTrack$: Observable<Track | null> = combineLatest([
    this.tracks,
    this.selectedTrackIndex,
  ]).pipe(
    map(([tracks, selectedTrackIndex]) => tracks[selectedTrackIndex] ?? null),
    shareReplay(1),
  );

  readonly selectedTrackIndex$: Observable<number> = this.selectedTrackIndex
    .asObservable();

  readonly selectedTrackAudio$: Observable<Howl | null> = this.selectedTrack$
    .pipe(
      scan(
        (previousTrackAudio, track) => {
          previousTrackAudio?.unload();

          if (!track) {
            return null;
          }

          const { categoryID, trackID } = track;

          return new Howl({
            src: [`/audio/${categoryID}/${trackID}.mp3`],
            preload: false,
          });
        },
        null as Howl | null,
      ),
      shareReplay(1),
    );

  readonly isTrackAudioPlaying$: Observable<boolean> = this.selectedTrackAudio$
    .pipe(
      switchMap((trackAudio) => {
        if (!trackAudio) {
          return [false];
        }

        return new Observable<boolean>((observer) => {
          observer.next(trackAudio.playing());

          const onPlaying = () => {
            observer.next(true);
          };

          const onPaused = () => {
            observer.next(false);
          };

          trackAudio.on("play", onPlaying);
          trackAudio.on("pause", onPaused);
          trackAudio.on("stop", onPaused);
          trackAudio.on("end", onPaused);

          return () => {
            trackAudio.off("play", onPlaying);
            trackAudio.off("pause", onPaused);
            trackAudio.off("stop", onPaused);
            trackAudio.off("end", onPaused);
          };
        });
      }),
      shareReplay(1),
    );

  readonly trackAudioProgression$: Observable<number> = combineLatest([
    this.selectedTrackAudio$,
    this.isTrackAudioPlaying$,
  ]).pipe(
    switchMap(([trackAudio, isPlaying]) => {
      if (!trackAudio) {
        return [0];
      }

      const getProgression = () => {
        const seek = trackAudio.seek();
        const duration = trackAudio.duration();

        return duration > 0 ? seek / duration : 0;
      };

      if (!isPlaying) {
        return [getProgression()];
      }

      return interval(100).pipe(
        map(getProgression),
        startWith(getProgression()),
        distinctUntilChanged(),
      );
    }),
    shareReplay(1),
  );

  constructor() {
    const {
      playlistState$,
      selectedTrackAudio$,
      selectedTrackIndex$,
      tracks$,
    } = this;

    playlistState$
      .pipe(
        withLatestFrom(selectedTrackIndex$),
        filter(
          ([playlistState, _selectedTrackIndex]) =>
            playlistState === PLAYLIST_STATE.TRACK_FLIPPED_OUT,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([_playbackState, selectedTrackIndex]) => {
        this.updateSelectedTrackIndex(selectedTrackIndex + 1);
      });

    playlistState$
      .pipe(
        withLatestFrom(selectedTrackIndex$, tracks$),
        filter(
          ([playbackState, selectedTrackIndex, tracks]) =>
            playbackState === PLAYLIST_STATE.TRACK_SWITCHED &&
            selectedTrackIndex >= tracks.length,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([_playbackState, _selectedTrackIndex, _tracks]) => {
        this.updatePlaylistState(PLAYLIST_STATE.PLAYLIST_END);
      });

    playlistState$
      .pipe(
        withLatestFrom(selectedTrackAudio$),
        filter(
          ([playlistState, selectedTrackAudio]) =>
            playlistState === PLAYLIST_STATE.TRACK_STARTED &&
            !!selectedTrackAudio,
        ),
        delay(1000),
        takeUntilDestroyed(),
      )
      .subscribe(([_playbackState, selectedTrackAudio]) => {
        selectedTrackAudio!.play();
        this.updatePlaylistState(PLAYLIST_STATE.TRACK_PLAYING);
      });

    selectedTrackAudio$
      .pipe(
        filter((selectedTrackAudio) =>
          selectedTrackAudio?.state() === "unloaded"
        ),
        takeUntilDestroyed(),
      )
      .subscribe((selectedTrackAudio) => {
        selectedTrackAudio!.load();
      });
  }

  async ngOnDestroy(): Promise<void> {
    const trackAudio = await firstValueFrom(this.selectedTrackAudio$);

    if (trackAudio?.playing()) {
      trackAudio.stop();
    }
  }

  updatePlaylistState(playbackState: PlaylistState): void {
    this.playlistState.next(playbackState);
  }

  updateSelectedTrackIndex(trackIndex: number): void {
    this.selectedTrackIndex.next(trackIndex);
  }

  updateTracks(tracks: Track[]): void {
    this.tracks.next(tracks);
    this.selectedTrackIndex.next(-1);
  }
}

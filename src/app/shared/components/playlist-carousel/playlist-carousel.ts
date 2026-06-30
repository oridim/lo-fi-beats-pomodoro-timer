import { AsyncPipe } from "@angular/common";
import type { OnDestroy, OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { Howl } from "howler";

import {
  PLAYLIST_STATE,
  PlaylistService,
} from "../../services/playlist-service";
import { preload } from "../../utils/howler";

import { TrackCover } from "../track-cover/track-cover";

const audioSwitchRecord: Howl = new Howl({
  src: ["/audio/ui/playlist-carousel-switch-record.mp3"],
  preload: false,
});

@Component({
  selector: "playlist-carousel",
  imports: [AsyncPipe, TrackCover],
  templateUrl: "./playlist-carousel.html",
  styleUrl: "./playlist-carousel.css",
})
export class PlaylistCarousel implements OnDestroy, OnInit {
  constructor(readonly playlistService: PlaylistService) {}

  ngOnInit(): void {
    preload(audioSwitchRecord);
  }

  ngOnDestroy(): void {
    audioSwitchRecord.stop();
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== "--playlist-carousel-current-index") {
      return;
    }

    this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_SWITCHED);
  }

  onTransitionStart(event: TransitionEvent): void {
    if (event.propertyName !== "--playlist-carousel-current-index") {
      return;
    }

    audioSwitchRecord.play();
    this.playlistService.updatePlaylistState(PLAYLIST_STATE.TRACK_SWITCHING);
  }
}

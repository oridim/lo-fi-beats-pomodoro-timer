import { ResolveFn } from "@angular/router";

import type { Track, TrackList } from "../types/tracks";
import { shuffleArray } from "../utils/random";

export const trackListResolver = (async (_route, _state) => {
  const response = await fetch("/data/track-list.json");
  const trackList = (await response.json()) as TrackList;

  const categories = shuffleArray(
    trackList.categories.map(({ categoryID, tracks }) =>
      shuffleArray(tracks).map((track) => ({
        ...track,
        categoryID,
      }))
    ),
  );

  const numberOfTracks = categories.reduce(
    (trackCount, tracks) => trackCount + tracks.length,
    0,
  );
  const tracks: Track[] = Array.from({ length: numberOfTracks });

  let trackIndex = 0;

  while (categories.length > 0) {
    const category = categories.shift()!;
    tracks[trackIndex] = category.shift()!;

    if (category.length > 0) {
      categories.push(category);
    }

    trackIndex = trackIndex + 1;
  }

  return tracks;
}) satisfies ResolveFn<Track[]>;

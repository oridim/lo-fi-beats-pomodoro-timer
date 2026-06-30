export interface Track {
  readonly categoryID: string;

  readonly trackID: string;

  readonly trackTitle: string;
}

export interface TrackListItem {
  readonly trackID: string;

  readonly trackTitle: string;
}

export interface TrackListCategory {
  readonly categoryID: string;

  readonly categoryTitle: string;

  readonly tracks: TrackListItem[];
}

export interface TrackList {
  readonly categories: TrackListCategory[];
}

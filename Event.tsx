export interface Event {
  event_id: number;
  title: string | undefined;
  event_time: Date;
  event_poster_path: string | null;
}

import Parser from "rss-parser";
import { Event } from "./Event";
import { Client } from "pg";
import "dotenv/config";

const db = new Client({
  host: "newbackend.postgres.database.azure.com",
  port: 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "makerspace",
  ssl: {
    rejectUnauthorized: false,
  },
});

const parser = new Parser({
  customFields: {
    item: [
      "eventId",
      "eventUid",
      "groupId",
      "group",
      "groupType",
      "groupAcronym",
      "eventDate",
      "eventEndDate",
      "eventTime",
      "eventEndTime",
      "fullDescription",
      "eventPhoto",
      "eventPhotoFullUrl",
      "iCalLink",
      "eventLink",
      "eventType",
      "eventTypeId",
      "timeZone",
      "timeZoneId",
      "eventLocation",
      "locationType",
      "eventStartDateTime",
      "eventEndDateTime",
    ],
  },
});

(async () => {
  const feed = await parser.parseURL(
    "https://sbengaged.stonybrook.edu/rss_events?group_ids=36064,35445",
  );
  console.log(feed);
  await db.connect();

  for (const item of feed.items as any[]) {
    const event: Event = {
      event_id: Number(item.eventId),
      title: item.title,
      event_time: new Date(item.eventStartDateTime),
      event_poster_path: item.eventPhotoFullUrl,
    };

    await db.query(
      `INSERT INTO events_data (event_id, title, event_time, event_poster_path)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id) 
      DO UPDATE SET 
      title = EXCLUDED.title,
      event_time = EXCLUDED.event_time,
      event_poster_path = EXCLUDED.event_poster_path`,
      [
        event.event_id,
        event.title,
        event.event_time,
        event.event_poster_path ?? null,
      ],
    );
  }
  await db.end();
})();

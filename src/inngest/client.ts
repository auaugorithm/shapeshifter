import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ugc-video-creator",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

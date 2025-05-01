import { z } from "zod";

export const videoPlayerTimeSchema = z.object({
    hrs: z.string(),
    min: z.string(),
    sec: z.string(),
});

export type VideoPlayerTimeFormType = z.infer<typeof videoPlayerTimeSchema>;

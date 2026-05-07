export type MediaType = 'image' | 'video';

export interface APOD {
    date: string, // "2026-05-07"
    title: string, // "The Tarantula Nebula"
    explanation: string, // Long description paragraph
    url: string, // Long description paragraph
    hdurl?: string, // HD version — optional, not always present
    copyright?: string     // Optional — some are public domain
    thumbnail_url?: string // Only present when media_type is "video"
    service_version: string // "v1"
    media_type?:string
}


// When we fetch a date range for the D3 chart
export interface APODRange {
  date: string
  media_type: MediaType
  title: string
}
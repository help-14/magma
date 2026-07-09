import { query } from '$app/server'
import * as v from 'valibot'
import { createCache } from '$lib/server/cache.js'

const channelListSchema = v.array(v.string())

type YoutubeVideo = {
  videoId: string
  title: string
  published: string
  thumbnail: string
  channelName: string
  channelUrl: string
  videoUrl: string
}
type YoutubeLive = {
  channelId: string
  isLive: boolean
  videoId?: string
  title?: string
  thumbnail?: string
  channelName: string
  videoUrl?: string
}

const uploadsCache = createCache<YoutubeVideo[]>(600_000, 50)
const livestreamCache = createCache<YoutubeLive>(600_000, 50)

function parseFeedXml(xml: string): YoutubeVideo[] {
  const entries: YoutubeVideo[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]
    const title = entry.match(/<title(?:[^>]*)>([^<]+)<\/title>/)?.[1]
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]
    const thumbnail = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
    const channelName = entry.match(/<name>([^<]+)<\/name>/)?.[1]
    const channelUrl = entry.match(/<uri>([^<]+)<\/uri>/)?.[1]
    if (videoId && title) {
      entries.push({
        videoId,
        title,
        published: published || '',
        thumbnail:
          thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channelName: channelName || '',
        channelUrl: channelUrl || '',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`
      })
    }
  }
  return entries
}

export const getYoutubeUploads = query(
  v.object({
    channels: channelListSchema,
    limit: v.optional(v.number(), 10)
  }),
  async ({ channels, limit }) => {
    try {
      const results = await Promise.allSettled(
        channels.map(async (channelId) => {
          const cacheKey = `uploads:${channelId}`
          return uploadsCache.getOrSet(cacheKey, async () => {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
            const response = await fetch(url)
            if (!response.ok)
              throw new Error(
                `HTTP ${response.status} for channel ${channelId}`
              )
            const xml = await response.text()
            const parsed = parseFeedXml(xml)
            if (parsed.length === 0)
              throw new Error(`No entries for channel ${channelId}`)
            return parsed
          })
        })
      )

      const allVideos: YoutubeVideo[] = []
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allVideos.push(...result.value)
        }
      }

      if (allVideos.length === 0) {
        return { ok: false, error: 'No videos found' }
      }

      allVideos.sort(
        (a, b) =>
          new Date(b.published).getTime() - new Date(a.published).getTime()
      )
      const videos = allVideos.slice(0, limit)

      return { ok: true, data: { mode: 'uploads', videos } }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)

export const getYoutubeLivestreams = query(
  v.object({ channels: channelListSchema }),
  async ({ channels }) => {
    try {
      const results = await Promise.allSettled(
        channels.map(async (channelId) => {
          const cacheKey = `live:${channelId}`
          return livestreamCache.getOrSet(cacheKey, async () => {
            const liveUrl = `https://www.youtube.com/channel/${channelId}/live`
            const response = await fetch(liveUrl)
            const videoMatch = response.url.match(/[?&]v=([^&]+)/)
            const videoId = videoMatch ? videoMatch[1] : null

            if (!videoId) {
              let channelName = channelId
              try {
                const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
                const feedRes = await fetch(feedUrl)
                if (feedRes.ok) {
                  const feedXml = await feedRes.text()
                  const feedVideos = parseFeedXml(feedXml)
                  if (feedVideos.length > 0 && feedVideos[0].channelName) {
                    channelName = feedVideos[0].channelName
                  }
                }
              } catch {}
              return { channelId, isLive: false, channelName }
            }

            const oembedRes = await fetch(
              `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
            )
            const info = oembedRes.ok ? await oembedRes.json() : null

            return {
              channelId,
              isLive: true,
              videoId,
              title: info?.title || '',
              thumbnail:
                info?.thumbnail_url ||
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              channelName: info?.author_name || '',
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`
            }
          })
        })
      )

      const channelsData: YoutubeLive[] = []
      for (const result of results) {
        if (result.status === 'fulfilled') {
          channelsData.push(result.value)
        } else {
          channelsData.push({
            channelId: 'unknown',
            isLive: false,
            channelName: 'Unknown'
          })
        }
      }

      return { ok: true, data: { mode: 'livestream', channels: channelsData } }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)

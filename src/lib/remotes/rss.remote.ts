import { ErrorCode } from '$lib/errors.js'
import { query } from '$app/server'
import * as v from 'valibot'
import { XMLParser } from 'fast-xml-parser'
import { createCache, stableCacheKey } from '$lib/server/cache.js'

type Article = {
  title: string
  link: string
  pubDate: string
  description: any
  feedTitle: string
  thumbnail: any
  categories: string[]
}
type FeedConfig = {
  url: string
  title?: string
  headers?: Record<string, string>
  limit?: number
}

const cache = createCache<Article[]>(600_000, 50)

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text'
})

function parseFeed(xml: string) {
  const doc = parser.parse(xml)
  let channel = doc.rss?.channel || doc.feed || doc.RDF?.channel
  let items: any[] = []

  if (doc.rss && doc.rss.channel?.item) {
    items = doc.rss.channel.item
  } else if (doc.feed?.entry) {
    items = doc.feed.entry
  } else if (doc.RDF?.item) {
    items = Array.isArray(doc.RDF.item) ? doc.RDF.item : [doc.RDF.item]
  }

  const feedTitle = channel?.title || doc.feed?.title || ''
  return { items: Array.isArray(items) ? items : [items], feedTitle }
}

function extractArticle(item: any, feedTitle: string): Article {
  const title = item.title || item.title?.['#text'] || ''
  let link = ''
  if (typeof item.link === 'string') {
    link = item.link
  } else if (item.link?.['@_href']) {
    link = item.link['@_href']
  } else if (Array.isArray(item.link)) {
    const alt = item.link.find((l: any) => l['@_rel'] === 'alternate')
    link = (alt || item.link[0])?.['@_href'] || ''
  }

  let pubDate =
    item.pubDate || item.updated || item['dc:date'] || item.published || ''
  let description = item.description || item.summary || item.content || ''

  if (typeof description === 'object' && description['#text']) {
    description = description['#text']
  }

  const thumbnail =
    item['media:thumbnail']?.['@_url'] ||
    item['media:content']?.['@_url'] ||
    item['media:thumbnail'] ||
    ''

  const categories = []
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category]
    for (const c of cats) {
      categories.push(
        typeof c === 'string' ? c : c['#text'] || c['@_term'] || ''
      )
    }
  }

  return { title, link, pubDate, description, feedTitle, thumbnail, categories }
}

export const fetchRss = query(
  v.object({
    feeds: v.string(),
    limit: v.optional(v.number(), 25),
    preserveOrder: v.optional(v.boolean(), false)
  }),
  async ({ feeds: feedsJson, limit, preserveOrder }) => {
    let feeds: FeedConfig[]
    try {
      feeds = JSON.parse(feedsJson)
    } catch {
      return {
        articles: [],
        errors: [{ feedUrl: '', message: ErrorCode.INVALID_FEEDS_JSON }]
      }
    }
    const errors: { feedUrl: string; message: string }[] = []
    const allArticles: Article[] = []

    for (const feed of feeds) {
      try {
        const headers = feed.headers || {}
        const feedKey = stableCacheKey({
          url: feed.url,
          headers,
          limit: feed.limit
        })
        const feedArticles = await cache.getOrSet(feedKey, async () => {
          const response = await fetch(feed.url, { headers })
          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
          }

          const xml = await response.text()
          const { items, feedTitle } = parseFeed(xml)
          const title = feed.title || feedTitle
          const feedLimit = feed.limit || Infinity
          let count = 0

          const articles: Article[] = []
          for (const item of items) {
            if (count >= feedLimit) break
            const article = extractArticle(item, title)
            if (!article.title) continue
            articles.push(article)
            count++
          }

          return articles
        })
        allArticles.push(...feedArticles)
      } catch (err) {
        errors.push({
          feedUrl: feed.url,
            message: err instanceof Error ? err.message : ErrorCode.FETCH_FAILED
        })
      }
    }

    const seen = new Set<string>()
    const unique: Article[] = []
    for (const a of allArticles) {
      if (!a.link || seen.has(a.link)) continue
      seen.add(a.link)
      unique.push(a)
    }

    if (!preserveOrder) {
      unique.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
        return db - da
      })
    }

    return { articles: unique.slice(0, limit), errors }
  }
)

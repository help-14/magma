import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Magma',
  description: 'A self-hosted SvelteKit dashboard for widgets, services, feeds, and personal workflows.',
  lang: 'en',
  base: '/',
  lastUpdated: false,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  themeConfig: {
    logo: null,
    siteTitle: 'Magma',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Widgets', link: '/widgets/' },
      { text: 'Settings', link: '/settings/' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/help-14/magma' }
    ],
    sidebar: {
      '/widgets/': [
        {
          text: 'Widgets',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/widgets/' },
            { text: 'Button', link: '/widgets/button' },
            { text: 'Search', link: '/widgets/search' },
            { text: 'Timer', link: '/widgets/timer' },
            { text: 'Weather', link: '/widgets/weather' },
            { text: 'Calendar', link: '/widgets/calendar' },
            { text: 'Stack', link: '/widgets/stack' },
            { text: 'Docker Status', link: '/widgets/docker-status' },
            { text: 'Fetch', link: '/widgets/fetch' },
            { text: 'Website', link: '/widgets/website' },
            { text: 'DeepSeek', link: '/widgets/deepseek' },
            { text: 'YouTube', link: '/widgets/youtube-live' },
            { text: 'RSS', link: '/widgets/rss' },
            { text: 'Stock', link: '/widgets/stock' },
            { text: 'GitHub Repo', link: '/widgets/github-repo' },
          ]
        }
      ],
      '/settings': [
        {
          text: 'Settings',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/settings/' },
            { text: 'System Settings', link: '/settings/system' },
            { text: 'Dashboard Settings', link: '/settings/dashboard' },
            { text: 'CSS Override', link: '/settings/override-css' },
          ]
        }
      ]
    }
  }
})

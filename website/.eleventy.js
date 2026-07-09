import markdownItAnchor from 'markdown-it-anchor'

const passthrough = {
  'website/src/assets': 'assets'
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy(passthrough)

  eleventyConfig.amendLibrary('md', (md) => {
    md.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink(),
      slugify: eleventyConfig.getFilter('slugify')
    })
  })

  eleventyConfig.addShortcode('widgetCard', function (widget) {
    return `<article class="widget-card">
      <div class="widget-card__meta">${widget.size}</div>
      <h3><a href="/widgets/${widget.slug}/">${widget.title}</a></h3>
      <p>${widget.summary}</p>
      <span>${widget.configFields.join(' · ')}</span>
    </article>`
  })

  eleventyConfig.addFilter('json', (value) => JSON.stringify(value, null, 2))

  return {
    pathPrefix: process.env.BASE_PATH || '/',
    dir: {
      input: 'website/src',
      includes: '_includes',
      data: '_data',
      output: 'website/_site'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  }
}

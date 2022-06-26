const generateMeta = (
  title: string,
  description: string,
  image: string
): string => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta charset="UTF-8" />
      <meta property="og:url" content="http://www.bcharity.net" />
      <meta property="og:site_name" content="BCharity" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
    
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:site" content="BCharity" />
      <meta property="twitter:title" content="${title}" />
      <meta property="twitter:description" content="${description}" />
      <meta property="twitter:image:src" content="${image}" />
      <meta property="twitter:image:width" content="400" />
      <meta property="twitter:image:height" content="400" />
      <meta property="twitter:creator" content="bcharityxyz" />
    </head>
  </html>`
}

export default generateMeta

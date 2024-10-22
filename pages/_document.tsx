// pages/_document.tsx

import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Vos balises <link> ou <meta> */}
        </Head>
        <body className="font-flame">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

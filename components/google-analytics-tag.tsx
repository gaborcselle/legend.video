'use client'

export default function GoogleAnalytics() {
  const googleAnalyticsTag = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG

  if (!googleAnalyticsTag) {
    return <></>
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsTag}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsTag}');
            `
        }}
      />
    </>
  )
}

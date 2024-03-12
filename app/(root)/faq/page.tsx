import type { Metadata } from 'next'

import FaqItem from '@/components/faq-item'

export const metadata: Metadata = {
  title: 'FAQ'
}

export default function FAQ() {
  return (
    <div className="container !max-w-screen-md py-6 md:py-12 flex flex-col space-y-4">
      <h1 className="text-2xl md:text-4xl font-bold">
        Frequently Asked Questions
      </h1>

      <FaqItem title="1. What is legend.video?">
        <p>
          Legend.video is your open-source AI director. It lets you go from concept to video 
          with GenAI video models. You can use it to create a storyboard with
          scenes and shots, generate AI video, and download the assets.
        </p>
        <p>
          The source code for legend.video is available on GitHub at <a className="underline" href="https://github.com/gaborcselle/legend.video">
            github.com/gaborcselle/legend.video
          </a>.
        </p>

      </FaqItem>

      <FaqItem title="2. Why did you build Legend.video?">
        <p>
          Gen AI video models are getting better. When we saw OpenAI's SORA
          announcement, it became clear that we're going to see a quantum leap
          in video quality soon. But none of the video models allow you tell
          stories - they just make short sequences around 2-4 seconds. 
          We wanted to build a tool that would allow you to tell stories with AI-generated video.
        </p>
      </FaqItem>

      <FaqItem title="3. How does this work?">
        <p>
          We use OpenAI's GPT-4-turbo-preview to generate the storyboard, and
          then Stable Diffusion models for text-to-image and image-to-video. We
          will replace these models once better ones become available.
        </p>
      </FaqItem>

      <FaqItem title="4. Who built this?">
        <p>
          Legend.video was started by <a className="underline" href="https://www.twitter.com/gabor">
            @gabor
          </a> and built with many others - please see the
          Contributors section on the&nbsp;
          <a
            className="underline"
            href="https://github.com/gaborcselle/legend.video"
          >
            project's Github page
          </a>
          .
        </p>
      </FaqItem>

      <FaqItem title="5. How can I help?">
        <div>
          We have a long list of potential projects in the 
          <a className="underline" 
            href="https://github.com/gaborcselle/legend.video?tab=readme-ov-file#where-you-can-help">
              &quot;Where you can help&quot;</a>
          section of our GitHub page. We'd love your help with any of these.
        </div>
      </FaqItem>

      <FaqItem title="6. Do I have to buy a subscription?">
        <p>
          No. We have a credits system to make sure users don't utilize all our
          resources. You get 200 free credits when you sign up. You can then buy
          more credits: 200 credits for $5, 1000 credits for $30, or 5000 credits for $50.
          We have calculated these prices so that we can cover our AI provider bills.
        </p>
        <p>
          Legend.video is open source <a className="underline"
            href="https://github.com/gaborcselle/legend.video">on Github</a>, 
            if you don't want to pay for credits, you can
            run your own instance of the software.
        </p>
      </FaqItem>
    </div>
  )
}

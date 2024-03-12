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

      <FaqItem title="1. Who built this?">
        <p>
          Gabor Cselle (
          <a className="underline" href="https://www.twitter.com/gabor">
            @gabor
          </a>
          ,&nbsp;
          <a className="underline" href="https://linkedin.com/in/gaborcselle">
            LinkedIn
          </a>
          ) started the project, but we had help from others - see the
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

      <FaqItem title="2. Why did you build this?">
        <p>
          Gen AI video models are getting better. When we saw OpenAI's SORA
          announcement, it became clear that we're going to see a quantum leap
          in video quality soon. But none of the video models allow you tell
          stories - they just make short sequences. We wanted to build a tool
          that would allow you to tell stories with AI-generated video.
        </p>
      </FaqItem>

      <FaqItem title="3. How does this work?">
        <p>
          We use OpenAI's GPT-4-turbo-preview to generate the storyboard, and
          then Stable Diffusion models for text-to-image and image-to-video. We
          will replace these models once stronger models become available.
        </p>
      </FaqItem>

      <FaqItem title="4. How can I help?">
        <div>
          We need help with lots of things:
          <ol>
            <li>
              Keeping scenes consistent - the approach we use now is text-based
              + choosing model checkpoints to keep styling consistent. We'd like
              to evaluate approaches that use latent space embeddings.
            </li>
            <li>
              Change storyboard with prompts. You should be able to change the
              storyboard by saying things like &quot;add another scene&quot;.
            </li>
            <li>
              Please check the{' '}
              <a
                className="underline"
                href="https://github.com/gaborcselle/legend.video/issues"
              >
                issues page
              </a>{' '}
              on GitHub to see what else you can help with.
            </li>
          </ol>
        </div>
      </FaqItem>

      <FaqItem title="5. Do you make money with the credits?">
        <p>
          No. We're projecting to break even after paying for hosting and
          AI-as-a-service fees.
        </p>
      </FaqItem>
    </div>
  )
}

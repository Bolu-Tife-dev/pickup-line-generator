# Pickup Line Generator

<div align="center">
<img src="/public/logo.svg" alt="Logo" width="80" height="80">

<h3 align="center">Pickup Line Generator</h3>

<p align="center">
Upload a screenshot of your chat — the AI reads the vibe and writes your perfect next message!
<br/>
<br/>
<a href="https://github.com/Bolu-Tife-dev/pickup-line-generator"><strong>Explore the docs »</strong></a>
<br/>
<br/>
<a href="https://pickup-line-generator-tau.vercel.app">View Demo</a> ·
<a href="https://github.com/Bolu-Tife-dev/pickup-line-generator/issues">Report Bug</a> ·
<a href="https://github.com/Bolu-Tife-dev/pickup-line-generator/issues">Request Feature</a>
</p>
</div>

## About The Project

![Product Screenshot](/public/screenshot.png)

Pickup Line Generator is a fun and creative web application that helps you craft the perfect message for your crush. Upload a screenshot or screen recording of your chat and the AI reads the vibe, tells you how the conversation currently reads, then writes two replies that match its tone. You can also just describe your crush and pick a style for two text-only pickup lines.

Key features:

- Chat screenshot / screen recording mode — the AI analyzes the conversation first and reports its vibe (Cold, Nonchalant, Flirty, Calm, …) before showing your two replies
- Text mode — describe your crush and choose a style for two tailored pickup lines
- AI generation via Groq (primary) and Google Gemini (fallback), both free tier, through the OpenAI-compatible SDK
- Responsive design for seamless use on desktop and mobile devices
- No account required — open the app and generate (single-user, auth-free)

## Built With

This project is built using modern web technologies and frameworks:

- Next.js [App Router](https://nextjs.org/docs/app) for framework
- [TypeScript](https://www.typescriptlang.org/) for type checking, safety, and code organization
- [Tailwind CSS](https://tailwindcss.com/) for styling and responsive design
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Groq](https://console.groq.com/) for fast, free text generation (primary)
- [Google Gemini](https://aistudio.google.com/) for chat-screenshot vision analysis and text fallback
- [OpenAI SDK](https://openai.com/) as the OpenAI-compatible client used to call both providers
- [Upstash](https://upstash.com/) for rate limiting
- [Vercel](https://vercel.com/) (for deployment)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Bolu-Tife-dev/pickup-line-generator.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Set up environment variables

   ```sh
   cp .env.example .env.local
   ```

   Then, fill in the necessary API keys and configuration in the `.env.local` file.

4. Run the development server
   ```sh
   npm run dev
   ```

## Usage

1. Open the application in your web browser
2. Upload a screenshot or screen recording of your chat, and/or add a note giving the AI extra context
3. Click the "Write My Perfect Reply" button
4. Read the chat vibe the AI reports first (Cold, Nonchalant, Flirty, Calm, …), then copy your two replies
5. Hit "Regenerate Pickup Line" whenever you want a fresh pair (rate limited)

## Roadmap

- [x] Rate Limiting API calls & Regenerations (w/ [Upstash](https://github.com/upstash/ratelimit-js))
- [ ] Implement user profiles and saved pickup lines
- [ ] Add social sharing features
- [ ] Expand language support for international users

See the [open issues](https://github.com/Bolu-Tife-dev/pickup-line-generator/issues) for a full list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- GitHub: [@Bolu-Tife-dev](https://github.com/Bolu-Tife-dev)

Project Link: [https://github.com/Bolu-Tife-dev/pickup-line-generator](https://github.com/Bolu-Tife-dev/pickup-line-generator)

## Acknowledgments

- Originally created by Arghya Dutta ([@Arghyad18](https://twitter.com/Arghyad18)) — [NemesisLW/pickup-line-generator](https://github.com/NemesisLW/pickup-line-generator)
- [1811 Labs](https://bento.me/1811labs) for the assignment
- [Vercel](https://vercel.com/) for hosting and deployment
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components

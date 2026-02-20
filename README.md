# NomadAI 🌍✨

> **Your personal concierge for global exploration.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

NomadAI is a premium, AI-powered travel assistant designed for modern travelers and digital nomads. Built with a focus on high-end aesthetics and seamless user experience, it acts as your knowledgeable guide to luxury stays, hidden gems, and personalized itineraries worldwide.

---

## 🎨 Design Philosophy: "Lux Digital"

NomadAI isn't just a chatbot; it's an immersive experience. The interface is crafted with a **"Lux Digital"** theme featuring:
-   **Glassmorphism:** Deep background blurs and translucent layers for a modern, depth-rich feel.
-   **App-like Fluidity:** Smooth transitions, responsive layouts, and mobile-first interactions.
-   **Premium Typography:** A curated blend of **Geist Mono** for technical details and **Inter** for readability.
-   **Responsive Design:** A collapsible sidebar and bottom-sheet navigation on mobile ensure browsing is effortless on any device.

## ✨ Key Features

-   **🤖 AI Concierge:** Intelligent conversation engine for planning trips, finding flights, and suggesting local experiences.
-   **💎 Luxury Insight:** Curated recommendations for top-tier hotels and exclusive suites.
-   **🗺️ Hidden Gems:** Discover secret spots and local favorites off the beaten path.
-   **📅 Smart Itineraries:** Generate day-by-day travel plans tailored to your pace and interests.
-   **🌗 Dark Mode Native:** Designed from the ground up for visual comfort in any lighting.

## 🛠 Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4), PostCSS
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Animation:** [Framer Motion](https://www.framer.com/motion/)
-   **AI Integration:** Google Gemini API (via Generative AI SDK)
-   **Language:** TypeScript

## 🚀 Getting Started

Follow these steps to set up NomadAI locally on your machine.

### Prerequisites

-   Node.js 18+ installed
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arynttai/NomadAI.git
    cd NomadAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your API keys:
    ```env
    # .env
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## � Project Structure

```bash
src/
├── app/
│   ├── api/chat/      # AI Backend Route
│   ├── globals.css    # Global styles & Tailwind layers
│   ├── layout.tsx     # Root layout & Metadata
│   └── page.tsx       # Main UI & Chat Interface
├── components/        # Reusable UI components
└── lib/               # Utilities and helper functions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/arynttai">Akma</a>
</p>
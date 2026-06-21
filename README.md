# 📊 RepoPulse

> Understand any GitHub repository in seconds. Analyze maintenance, activity, documentation quality, testing coverage, and community health before adopting a library.

RepoPulse is a developer-focused tool designed to provide deep insights into GitHub repositories. Whether you're evaluating open-source dependencies or checking the health of your own projects, RepoPulse gives you a comprehensive overview of repository activity, issues, community standards, and continuous integration practices.

---

## ✨ Features

- **🚀 Instant Analysis**: Get a complete health check of any public GitHub repository.
- **📈 Activity Tracking**: View recent commit history, issue resolution rates, and contributor counts.
- **🛡️ Quality Assurance**: Automatically detect Continuous Integration (CI) workflows and testing setups.
- **👥 Community Health**: Evaluate community profiles, including READMEs, Licenses, and contributing guidelines.
- **⚖️ Repository Comparison**: Compare multiple repositories side-by-side to make informed decisions on which library to adopt.
- **🌙 Dark Mode**: Beautiful and fully responsive UI with a built-in dark mode.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with SQLite (configurable)
- **API Integration**: [Octokit](https://github.com/octokit/octokit.js) (GitHub API)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to run RepoPulse locally on your machine.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sauravbhojak/repo-pulse.git
   cd repo-pulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root of the project and add the following:
   ```env
   # Your GitHub Personal Access Token (for higher API rate limits)
   GITHUB_TOKEN=your_github_personal_access_token
   
   # Database URL for Prisma (SQLite by default)
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 🔑 GitHub Token Setup

RepoPulse uses the GitHub API to fetch repository data. While it can run without authentication, you will hit rate limits very quickly (60 requests/hour). 

To increase your rate limit (to 5,000 requests/hour):
1. Go to your GitHub [Developer Settings](https://github.com/settings/tokens).
2. Generate a new **Personal Access Token (classic)**. No specific scopes are required for public repositories.
3. Paste the token into your `.env` file as `GITHUB_TOKEN`.

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

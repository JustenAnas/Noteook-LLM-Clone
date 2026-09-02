# Gemini Notebook (NotebookLM Clone)

An open-source, full-stack alternative to Google's NotebookLM. This application acts as your personalized AI research partner, allowing you to upload your own documents, websites, and videos to build a private knowledge base. Using advanced Retrieval-Augmented Generation (RAG), the AI strictly grounds its answers in the sources you provide — complete with precise inline citations.

**🔗 Live Demo:** [noteook-llm-clone-3ok5.vercel.app](https://noteook-llm-clone-3ok5.vercel.app/)

## ✨ Key Features

- **Multi-Modal Source Uploads:** Effortlessly ingest context from various sources:
  - **PDFs:** Automatic parsing, chunking, and cloud storage via Cloudinary.
  - **Websites:** Automated scraping and markdown conversion via Firecrawl.
  - **YouTube Videos:** Automatic fetching of video transcripts.
  - **Raw Text / Markdown:** Directly copy and paste notes.
- **Grounded AI Chat (RAG):** Ask questions and get answers based *exclusively* on your selected sources to eliminate AI hallucinations.
- **Notebook Guides:** Automatically generate Study Guides, FAQs, Briefing Docs, and Timelines from your materials.
- **Asynchronous Processing:** Highly reliable background job processing using Inngest for embedding generation and document chunking.
- **Custom Authentication:** Secure, Redis-backed OTP email verification for user registration and password resets.
- **Modern UI/UX:** Responsive, beautiful interface built to mirror the sleek aesthetic of Google products.

## 🛠️ Tech Stack

**Frontend:**

- [Next.js 15+ (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for real-time chat streaming
- Lucide React (Icons) & Google Sans Typography

**Backend:**

- [Express.js](https://expressjs.com/) (REST API)
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- [Inngest](https://www.inngest.com/) for reliable background job queues
- [Pinecone](https://www.pinecone.io/) for Serverless Vector Database storage
- [OpenAI API](https://openai.com/) (`gpt-4o-mini`, `text-embedding-3-small`)
- [Redis](https://redis.io/) (Upstash/Local) & Nodemailer for OTP Auth flows
- [Cloudinary](https://cloudinary.com/) for PDF asset storage

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Redis Server (Local or Upstash)
- API Keys for OpenAI, Pinecone, Cloudinary, and Firecrawl.

### 1. Clone the repository

```bash
git clone https://github.com/JustenAnas/noteook-llm-clone.git
cd noteook-llm-clone
```

### 2. Setup the Server (Backend)

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the server directory and add your environment variables:

```env
# Server
PORT=8081
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notebook"

# Auth & Redis
SESSION_SECRET="your-super-secret-session-key"
REDIS_URL="redis://localhost:6379"

# SMTP (Optional: Defaults to Ethereal Email for dev if blank)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# AI & Vector DB
OPENAI_API_KEY="sk-..."
PINECONE_API_KEY="pcsk_..."
PINECONE_INDEX="chaibook"

# 3rd Party APIs
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
FIRECRAWL_API_KEY="fc-..."
```

Run database migrations and start the backend development server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Start the Inngest Background Worker

Open a new terminal window inside the `server` directory to start the Inngest dev server for handling document processing queues:

```bash
npx inngest-cli@latest dev -u http://localhost:8081/api/inngest
```

### 4. Setup the Client (Frontend)

Open a new terminal window, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Create a `.env.local` file in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

Start the Next.js development server:

```bash
npm run dev
```

Your frontend should now be running at [http://localhost:3000](http://localhost:3000).

## 🏗️ Architecture & How It Works

1. **Source Ingestion:** When a user uploads a PDF or website, the Node backend stores the raw file in Cloudinary (or fetches the HTML via Firecrawl).
2. **Event Queue:** An event (`source/created`) is fired off to the Inngest background server.
3. **Processing (RAG):** In the background, Inngest parses the text, splits it into semantically meaningful chunks (with 100-character overlaps), and hits the OpenAI API to generate vector embeddings.
4. **Vector Storage:** The embeddings and associated metadata (Source ID, Workspace ID) are upserted into Pinecone Serverless.
5. **Chat:** When a user asks a question, the Vercel AI SDK streams the query to the backend. The backend queries Pinecone for the highest-scoring chunks related to the selected sources, builds a strict system prompt containing those exact texts, and streams back a hallucination-free response.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/JustenAnas/noteook-llm-clone/issues) if you want to contribute.

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👤 Author

Built by [Anas](https://github.com/JustenAnas)

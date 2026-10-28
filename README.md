# Gemini Notebook — NotebookLM Clone

An open-source, full-stack AI research assistant inspired by Google's NotebookLM.

Gemini Notebook lets users create research workspaces, import documents, websites, YouTube videos, and text, and interact with their content through AI-powered chat.

Built using **Next.js, Express.js, TypeScript, PostgreSQL, Prisma, Pinecone, OpenAI, and Inngest**, the application uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from user-selected sources and generate context-aware responses.

**🔗 Live Demo:** [Gemini Notebook](https://noteook-llm-clone-3ok5.vercel.app/)

**💻 GitHub:** [Source Code](https://github.com/JustenAnas/noteook-llm-clone)

---

## ✨ Key Features

### 📚 Multi-Source Knowledge Base

Create dedicated research workspaces and import content from multiple sources:

- **PDF Documents:** Upload PDFs, extract text, and store uploaded files using Cloudinary.
- **Websites:** Extract website content using Firecrawl with main-content filtering to reduce navigation menus, unrelated links, and page clutter.
- **YouTube Videos:** Retrieve available video transcripts using the Supadata API, with timestamped transcript content where supported.
- **Text & Markdown:** Add notes and written content directly to your workspace.

Imported sources can be processed into searchable knowledge for AI-powered conversations.

### 🤖 Source-Grounded AI Chat

Ask questions about your uploaded content using Retrieval-Augmented Generation.

- Semantic search powered by Pinecone.
- OpenAI embeddings for document retrieval.
- Context-aware responses based on retrieved source content.
- Select specific sources to include in conversations.
- Streaming AI responses.
- Source-based context to reduce unsupported answers.

### 📝 AI Notebook Guides

Automatically generate six types of learning and research materials from selected sources.

| Guide | Description |
|---|---|
| **Summary** | Generate a structured overview of source material. |
| **Key Takeaways** | Extract the most important facts and insights. |
| **Study Guide** | Create topic explanations, definitions, and review questions. |
| **FAQ** | Generate frequently asked questions with answers. |
| **Timeline** | Organize explicitly dated events chronologically. |
| **Briefing Doc** | Produce an executive-style briefing with findings and implications. |

Generated guides support Markdown formatting, including headings, lists, emphasis, and structured sections, using React Markdown and remark-gfm.

### ⚡ Background Document Processing

Uses **Inngest** to coordinate asynchronous document processing.

The ingestion pipeline includes:

1. Extracting text from imported sources.
2. Splitting source content into overlapping chunks.
3. Generating vector embeddings with OpenAI.
4. Storing vectors and metadata in Pinecone.
5. Making processed sources available for retrieval.

### 🔐 Authentication & Workspace Management

- User registration and login.
- Email OTP verification.
- Password reset flows.
- Redis-backed authentication-related workflows.
- Dedicated research workspaces.
- Source selection and management.

### 🎨 Modern User Interface

- Responsive Next.js interface.
- Tailwind CSS v4 and shadcn/ui.
- Lucide React icons.
- Streaming chat interface.
- Source management panels.
- Structured Markdown rendering.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Frontend framework |
| React 19 | UI development |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI components |
| Vercel AI SDK | AI streaming integration |
| React Markdown | Markdown rendering |
| remark-gfm | GitHub Flavored Markdown |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API |
| TypeScript | Backend development |
| Prisma ORM | Database access |
| PostgreSQL | Relational database |
| Redis | Authentication-related data and caching |
| Nodemailer | Email delivery |
| Inngest | Background processing |
| Pinecone | Vector database |
| OpenAI API | Chat generation and embeddings |
| Cloudinary | PDF file storage |
| Firecrawl | Website content extraction |
| Supadata | YouTube transcript retrieval |

### AI Models

- **Chat:** `gpt-4o-mini`
- **Embeddings:** `text-embedding-3-small`

---

## 🚀 Getting Started

### Prerequisites

Before running the application, install or configure:

- Node.js (a version compatible with the project's package requirements)
- npm
- PostgreSQL
- Redis
- OpenAI API key
- Pinecone API key and index
- Cloudinary credentials
- Firecrawl API key
- Supadata API key
- SMTP credentials for email delivery, if required by your configuration

### 1. Clone the Repository

```bash
git clone https://github.com/JustenAnas/noteook-llm-clone.git
cd noteook-llm-clone
```

### 2. Set Up the Backend

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
# Server
PORT=8081
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notebook"

# Authentication
SESSION_SECRET="your-secure-session-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="chaibook"

# Cloudinary
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

# Firecrawl
FIRECRAWL_API_KEY="your-firecrawl-api-key"

# YouTube Transcripts
SUPADATA_API_KEY="your-supadata-api-key"
```

**Security:** Never commit `.env` files or API keys to GitHub. Use your hosting provider's environment-variable settings in production.

Generate the Prisma client and synchronize the development database:

```bash
npx prisma generate
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:8081
```

### 3. Start Inngest

Open another terminal in the `server` directory:

```bash
npx inngest-cli@latest dev -u http://localhost:8081/api/inngest
```

This starts the local Inngest development server for background processing.

### 4. Set Up the Frontend

Open another terminal from the project root:

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

Start the frontend:

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

---

## 🏗️ System Architecture

```text
                  USER
                   |
                   v
           Next.js Frontend
                   |
                   v
           Express REST API
                   |
       +-----------+-----------+
       |                       |
       v                       v
 Authentication          Source Ingestion
       |                       |
       v              +--------+--------+
 PostgreSQL/Redis     |        |        |
                      v        v        v
                     PDF    Website   YouTube
                      |        |        |
                      v        v        v
                  PDF Parser Firecrawl Supadata
                      |        |        |
                      +--------+--------+
                               |
                               v
                         Source Content
                               |
                               v
                         Inngest Events
                               |
                               v
                         Text Chunking
                               |
                               v
                         OpenAI Embeddings
                               |
                               v
                         Pinecone Vector DB
                               |
                               v
                         Semantic Retrieval
                               |
                               v
                         OpenAI Chat Model
                               |
                               v
                         Streaming Response
                               |
                               v
                         Next.js Frontend
```

### How RAG Works

**1. Source ingestion**

Users import documents, websites, YouTube videos, or text into a research workspace.

**2. Text extraction**

The backend extracts readable content using the appropriate service:

- PDF parsing for documents.
- Firecrawl for websites.
- Supadata for available YouTube transcripts.
- Direct content handling for text.

**3. Background processing**

Inngest handles document-processing events, including chunking and embedding generation.

**4. Vector storage**

OpenAI generates embeddings for source chunks, which are stored in Pinecone alongside source and workspace metadata.

**5. Semantic retrieval**

When a user asks a question, the backend retrieves relevant chunks from the selected workspace sources.

**6. Response generation**

The retrieved content is supplied to the language model as context, and the response is streamed to the frontend.

This approach helps ground answers in imported content, although AI-generated responses should still be checked against their original sources.

---

## 📖 Notebook Guide Generation

The Notebook Guide system provides six tools for transforming imported content into structured research materials.

### Available Tools

**Summary:** A high-level overview organized by topics.

**Key Takeaways:** Important facts and conclusions in a concise format.

**Study Guide:** Definitions, explanations, key concepts, and review questions.

**FAQ:** Questions and answers based on the source material.

**Timeline:** A chronological view of dated events found in the sources.

**Briefing Doc:** A professional overview of findings, implications, and conclusions.

The backend uses tool-specific generation instructions, while the frontend renders generated content using Markdown.

---

## 🎬 YouTube Transcript Integration

YouTube video ingestion uses the **Supadata API** to retrieve available captions.

The integration supports common YouTube URL formats, including:

- Standard watch URLs
- Shortened `youtu.be` URLs
- YouTube Shorts
- Embedded video URLs
- Live video URLs with supported transcripts

Where timestamps are returned, transcript segments are formatted with timestamps before ingestion.

**Limitations:**

- Some videos may not have accessible transcripts.
- Transcript availability depends on the external provider.
- Free-tier API usage is limited.
- Very long videos may require asynchronous transcript processing.
- Successful transcript retrieval and ingestion depend on the availability of the external services.

The application handles API errors and provides feedback when transcript retrieval fails.

---

## ☁️ Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL |
| Vector Database | Pinecone |
| Background Processing | Inngest |
| File Storage | Cloudinary |
| YouTube Transcripts | Supadata |

**Live Application:** [Gemini Notebook](https://noteook-llm-clone-3ok5.vercel.app/)

### Production Configuration

For production deployments:

- Configure environment variables separately for frontend and backend.
- Ensure the frontend API URL points to the deployed backend.
- Configure database and Redis connections.
- Configure the Inngest production integration.
- Restrict CORS to trusted frontend origins.
- Keep API keys on the server.
- Monitor external API usage and rate limits.

---

## ⚠️ Known Limitations

- AI-generated responses and guides may contain factual inaccuracies.
- Source grounding reduces hallucinations but does not eliminate them.
- YouTube transcript retrieval depends on third-party availability and API quotas.
- Large source files may increase processing time and API usage.
- External services may introduce rate limits or temporary failures.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a pull request.

For issues and suggestions, visit the [GitHub Issues page](https://github.com/JustenAnas/noteook-llm-clone/issues).

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 👤 Author

Built by [Anas](https://github.com/JustenAnas).

**GitHub:** [JustenAnas](https://github.com/JustenAnas)
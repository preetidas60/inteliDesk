# InteliDesk 🧠🛡️

**AI-Assisted, Fraud-Aware Support Ticket Orchestration built with Motia**

InteliDesk is a production-grade backend system that models customer support tickets as long-running, resilient workflows. It automatically detects fraudulent or AI-generated complaints, resolves safe tickets using AI, escalates risky cases to humans, and enforces SLA — all using Motia's unified Steps runtime.

---

## 🚨 The Problem

Modern support systems struggle with:

- **Ticket overload** – Too many requests, not enough agents
- **AI-generated fake complaints & screenshots** – Hard to distinguish real from fake
- **Costly refund abuse** – Fraudulent claims drain revenue
- **Fragile cron + queue automations** – Complex infrastructure that breaks
- **Poor observability** – No visibility into what's happening

Most backends treat tickets as database rows. In reality, **tickets are long-running processes** involving time, retries, failures, and human interaction.

---

## ✅ The Solution

InteliDesk treats every ticket as a **durable workflow**, not a CRUD record. With Motia:

- **APIs, background jobs, AI, cron, streaming** → one unified runtime
- **No queues, no workers, no glue code** – Everything is a Step
- **Every ticket has a visible execution trace** – Full observability

---

## 🧠 Key Features

### 🔍 AI Proof Authenticity Detection

- Detects AI-generated complaint text
- Flags suspicious screenshots / proofs
- Routes risky tickets instead of auto-refunding

### 🤖 Controlled AI Automation

- AI classifies intent & confidence
- Deterministic routing logic decides:
  - Auto-resolve
  - Human escalation
- **No blind AI decisions** – Rules layer on top

### ⏱️ Built-in SLA Enforcement

- SLA tracked automatically per ticket
- Cron step escalates stalled tickets
- No polling, no external schedulers

### 👤 Human-in-the-Loop

- Only risky or ambiguous tickets reach agents
- Clean separation between AI and humans
- Agents see full context & execution trace

### 📡 Real-Time Streaming

- Live ticket updates for dashboards
- No polling required
- Built-in SSE streams

---

## 🧩 Architecture Overview

```
API (Create Ticket)
        ↓
   Validate Input
        ↓
Detect Proof Authenticity (Python)
        ↓
  Classify Intent (Python)
        ↓
   Decision Routing
    ├─ Auto Resolve
    └─ Human Escalation
        ↓
   Finalize Ticket

Parallel: SLA Watcher (Cron)
Streaming: ticket-updates
```

---

## 🛠️ Tech Stack

- **Motia** – Unified backend runtime
- **TypeScript** – APIs, orchestration, workflows
- **Python** – AI & ML-heavy steps
- **Zod / Pydantic** – Validation
- **SSE Streams** – Real-time updates

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate types
npx motia generate-types
```

---

## 📊 Observability

Every ticket has:

- ✅ A full execution trace
- ✅ Step-level logs
- ✅ Retry & failure visibility
- ✅ SLA breach tracking

> _"Every ticket is not a row in a database — it's a traceable execution."_

---

## 🏗️ Project Structure

```
intelidesk/
├── src/
│ ├── api/ # Public API endpoints (ticket creation, user replies)
│ │ ├── create-ticket.step.ts
│ │ └── user-reply.step.ts
│ │
│ ├── workflows/ # High-level workflow definitions (ticket lifecycle)
│ │ └── ticket-workflow.ts
│ │
│ ├── steps/ # Atomic workflow steps (Motia Steps)
│ │ ├── typescript/ # Orchestration & business logic (TS)
│ │ │ ├── validate-input.step.ts
│ │ │ ├── route-decision.step.ts
│ │ │ ├── auto-resolve.step.ts
│ │ │ ├── escalate-human.step.ts
│ │ │ ├── finalize-ticket.step.ts
│ │ │ └── sla-watcher.step.ts
│ │ │
│ │ └── python/ # AI / ML steps (Python)
│ │ ├── detect-proof-authenticity.step.py
│ │ └── classify-intent.step.py
│ │
│ ├── streams/ # Real-time Server-Sent Events (SSE)
│ │ └── ticket-updates.stream.ts
│ │
│ ├── types/ # Shared domain types & constants
│ │ ├── ticket.types.ts
│ │ ├── ticket.status.ts
│ │ └── ticket.constants.ts
│
├── motia.config.ts # Motia runtime configuration
├── package.json # Project dependencies & scripts
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
```

---

### 💡 Why this structure works well

- **Clear separation of concerns**
  - APIs ≠ workflows ≠ steps
- **Polyglot-friendly**
  - TypeScript for orchestration
  - Python for AI/ML
- **Motia-native**
  - Steps are atomic and observable
  - Streams are first-class
- **Hackathon-judge friendly**
  - Easy to understand
  - Easy to review
  - Looks production-ready

If you want, I can also:

- Simplify this further (if you want fewer folders)
- Align it _exactly_ with Motia’s default discovery rules
- Add a short “Structure Explained” section for README

Just tell me 👍

---

## 📝 Example: Creating a Ticket

```typescript
POST /api/tickets
Content-Type: application/json

{
  "customerId": "cust_123",
  "subject": "Damaged product received",
  "description": "The item arrived broken...",
  "proofUrls": ["https://example.com/image.jpg"],
  "priority": "high"
}
```

**Response:**

```json
{
  "ticketId": "ticket_abc123",
  "status": "processing",
  "workflowId": "wf_xyz789"
}
```

---

## 🔐 Security & Fraud Detection

InteliDesk uses multi-layer fraud detection:

1. **Text Analysis** – Detects GPT-generated complaints
2. **Image Verification** – Flags AI-generated or manipulated screenshots
3. **Pattern Recognition** – Identifies repeat offenders
4. **Confidence Scoring** – Only high-confidence cases auto-resolve

---

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with popular helpdesk tools
- [ ] Custom AI model fine-tuning
- [ ] Mobile app for agents

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Contact

For questions or support, reach out at: support@intelidesk.example.com

---

**Built with ❤️ using Motia**

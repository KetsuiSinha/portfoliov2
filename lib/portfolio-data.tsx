import type { KeyboardEvent, ReactNode } from "react";

export type BookSpread = {
  left: ReactNode;
  right: ReactNode;
};

export type BookDefinition = {
  title: string;
  subtitle: string;
  color: string;
  height: number;
  tabs?: string[];
};

type SkillGroup = {
  title: string;
  items: string[];
};

export const BOOKS: BookDefinition[] = [
  { title: "About Me", subtitle: "Who I am", color: "#4a455a", height: 0.8 },
  {
    title: "Skills",
    subtitle: "What I use",
    color: "#3d5a4a",
    height: 0.62,
    tabs: ["Languages", "Frontend", "Backend", "AI / ML", "Data & Cloud"],
  },
  {
    title: "Projects",
    subtitle: "What I've built",
    color: "#3a4a5a",
    height: 0.74,
    tabs: ["Pulse", "HospiBot"],
  },
  { title: "Hobbies", subtitle: "Off the clock", color: "#4a5a3a", height: 0.58 },
  { title: "Contact", subtitle: "Say hello", color: "#5a3a4a", height: 0.66 },
];

function Chips({ items }: { items: string[] }) {
  return (
    <div>
      {items.map((item) => (
        <span className="chip" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function buildSkillSpread({
  title,
  intro,
  description,
  groups,
}: {
  title: string;
  intro: string;
  description: string;
  groups: SkillGroup[];
}) {
  return {
    left: (
      <>
        <h2>{title}</h2>
        <p className="sub">{intro}</p>
        <p>{description}</p>
      </>
    ),
    right: (
      <>
        {groups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <Chips items={group.items} />
          </section>
        ))}
      </>
    ),
  } satisfies BookSpread;
}

function buildProjectSpread({
  title,
  summary,
  metadata,
  description,
  details,
}: {
  title: string;
  summary: string;
  metadata: string;
  description: string;
  details: string[];
}): BookSpread {
  return {
    left: (
      <>
        <h2>{title}</h2>
        <p className="sub">{summary}</p>
        <p className="meta">{metadata}</p>
        <p>{description}</p>
      </>
    ),
    right: (
      <>
        <h3>What I built</h3>
        <ul className="pts">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </>
    ),
  };
}

function buildHobbySpread({
  number,
  title,
  description,
  details,
}: {
  number: string;
  title: string;
  description: string;
  details: string[];
}): BookSpread {
  return {
    left: (
      <div className="photo photo--placeholder" aria-label={`Hobby ${number} photo placeholder`}>
        <span>{number}</span>
        <small>Photo goes here</small>
      </div>
    ),
    right: (
      <>
        <h2>{title}</h2>
        <p>{description}</p>
        <ul className="pts">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </>
    ),
  };
}

export function getBookPages(
  bookIndex: number,
  photo: string,
  onChoosePhoto: () => void,
): BookSpread[] {
  switch (bookIndex) {
    case 0: {
      const onPhotoKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChoosePhoto();
        }
      };

      return [
        {
          left: (
            <div
              className={`photo${photo ? " photo--with-image" : ""}`}
              style={photo ? { backgroundImage: `url(${photo})` } : undefined}
              title="Choose a photo"
              role="button"
              tabIndex={0}
              onClick={onChoosePhoto}
              onKeyDown={onPhotoKeyDown}
              aria-label="Choose your photo"
            >
              {!photo ? (
                <>
                  <span>NS</span>
                  <small>Click to add your photo</small>
                </>
              ) : null}
            </div>
          ),
          right: (
            <>
              <h2>Hi, I’m Nishchay.</h2>
              <p className="sub">Aspiring software development engineer, Mumbai</p>
              <p>
                I build backend applications and REST APIs with Python, Django, FastAPI and SQL, and I’m
                comfortable working across PostgreSQL and MySQL, debugging, and shipping clean, maintainable
                code.
              </p>
              <p>
                I’m a final-year Electronics &amp; Telecommunication student at Thakur College of Engineering and
                Technology (CGPA 8.09, 2022–2026), and currently a software engineering intern at G10 Consultancy,
                where I develop Django REST Framework APIs for business applications.
              </p>
              <p>Lately I’ve been building LLM-powered products and conversational AI that people actually use.</p>
            </>
          ),
        },
      ];
    }
    case 1:
      return [
        buildSkillSpread({
          title: "Languages & tools",
          intro: "Where I start",
          description: "Python is my main language; the rest cover the web, databases and daily workflow.",
          groups: [
            {
              title: "Languages",
              items: ["Python", "TypeScript", "JavaScript", "SQL", "C++", "HTML", "CSS"],
            },
            { title: "Tools", items: ["Git", "GitHub", "Postman", "Figma", "Jira"] },
            {
              title: "Concepts",
              items: ["Data Structures & Algorithms", "System Design", "Requirement Gathering"],
            },
          ],
        }),
        buildSkillSpread({
          title: "Frontend",
          intro: "Interfaces for the backends I build",
          description: "Used in Pulse’s multi-client review dashboard.",
          groups: [
            {
              title: "Frameworks",
              items: ["React.js", "Next.js", "Tailwind CSS", "shadcn/ui", "React Query"],
            },
            { title: "Testing", items: ["Jest", "React Testing Library", "Cypress"] },
          ],
        }),
        buildSkillSpread({
          title: "Backend & APIs",
          intro: "My core strength",
          description: "Django REST APIs at G10 Consultancy; FastAPI and Node.js in my projects.",
          groups: [
            {
              title: "Frameworks",
              items: ["FastAPI", "Django", "Django REST Framework", "Node.js", "Express.js"],
            },
            {
              title: "Patterns",
              items: ["REST", "Webhooks", "JWT / OAuth", "RBAC", "Socket.io", "Celery"],
            },
          ],
        }),
        buildSkillSpread({
          title: "AI / ML",
          intro: "LLMs and conversational AI",
          description: "Behind Pulse’s draft generation and HospiBot’s multilingual assistant.",
          groups: [
            {
              title: "LLMs",
              items: ["LLM Integration", "Prompt Engineering", "LangChain.js", "Feedback-Loop Calibration"],
            },
            {
              title: "Conversational AI",
              items: [
                "Dialogflow",
                "Intent Classification",
                "Entity Extraction",
                "Context Management",
                "Multilingual NLP",
                "Human-in-the-Loop Escalation",
              ],
            },
          ],
        }),
        buildSkillSpread({
          title: "Data & Cloud",
          intro: "Storing and shipping it",
          description: "Production deployments on AWS, Vercel and Railway.",
          groups: [
            { title: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase"] },
            {
              title: "DevOps / Cloud",
              items: [
                "Docker",
                "GitHub Actions (CI/CD)",
                "AWS EC2",
                "MongoDB Atlas",
                "Vercel",
                "Railway",
                "Linux",
              ],
            },
            { title: "Practice", items: ["Healthcare Data Privacy"] },
          ],
        }),
      ];
    case 2:
      return [
        buildProjectSpread({
          title: "Pulse",
          summary: "AI client update generator",
          metadata: "July 2026 – present · FastAPI, Next.js, PostgreSQL, LLM",
          description:
            "An LLM-powered system that writes client status updates for you by pulling real activity from GitHub, Linear and Slack.",
          details: [
            "Cut manual update writing from 2–3 hours a week per client to under 15 minutes.",
            "Built the ingestion pipeline and relevance filter in Python, with an activity normalization layer.",
            "LLM drafts calibrated to the user’s tone; relevance scoring improved 45% through iterative fine-tuning.",
            "Edit-capture loop feeds user corrections back into training.",
            "Multi-client review dashboard; deployed on Vercel and Railway with Redis, Celery and Stripe 3-tier billing.",
          ],
        }),
        buildProjectSpread({
          title: "HospiBot",
          summary: "AI healthcare chatbot",
          metadata: "Oct – Dec 2025 · Dialogflow, Node.js, MongoDB, Socket.io",
          description: "A multilingual (English, Hindi, Marathi) assistant live on Web, WhatsApp and Telegram.",
          details: [
            "500+ monthly patient interactions, 78% automated, replies in under 2 seconds, 4.2/5 satisfaction.",
            "Saved an estimated 40 staff hours a week.",
            "Dialogflow NLP for appointments, prescription refills, lab reports, FAQs and symptom triage with escalation to a nurse.",
            "Confidence-based fallback (0.7) with live-agent handoff over Socket.io.",
            "Privacy-minded: audit logs and patient consent. Deployed on AWS EC2 with CI/CD.",
          ],
        }),
      ];
    case 3:
      return [
        buildHobbySpread({
          number: "One",
          title: "HomeLabbing",
          description:
            "Building self-hosted infrastructure and experimenting with systems.",
          details: [
            "Understanding Arduino fundamentals and hardware workflows.",
            "Learning Raspberry Pi setups for practical home experiments.",
            "Making and maintaining personal servers for self-hosted tools.",
            "Building Docker images for portable and repeatable environments.",
            "Managing Proxmox containers for isolated infrastructure projects.",
            "Automating backups, monitoring and observability via Prometheus/Grafana.",
            "Secure remote access and VPN configurations for safe external access.",
          ],
        }),
        buildHobbySpread({
          number: "Two",
          title: "Reading",
          description:
            "Technology, psychology, business, and systems thinking through focused long-form reading.",
          details: [
            "System design books that shaped my architecture thinking.",
            "Technical knowledge notes to retain and apply what I learn.",
            "Novels that improve perspective, creativity, and storytelling sense.",
            "Maintaining a Zettelkasten-style note system to connect ideas.",
            "Curating concise reading lists and summaries for long-term review.",
            "Consuming long-form interviews and podcasts to complement reading.",
          ],
        }),
        buildHobbySpread({
          number: "Three",
          title: "Gaming",
          description:
            "Strategy, competitive, and immersive experiences with a strong preference for challenging worlds.",
          details: [
            "Soulsborne games for challenge, patience, and pattern mastery.",
            "RPGs for narrative depth, progression systems, and world immersion.",
            "Build optimization and progression planning across long-form campaigns.",
            "Co-op and multiplayer sessions that improve decision speed and adaptability.",
            "Studying balance and meta to inform tactical play and theorycrafting.",
            "Speedrunning and optimization challenges to push mechanical limits.",
          ],
        }),
        buildHobbySpread({
          number: "Four",
          title: "Anime",
          description:
            "Stories, world-building, and visual creativity across a broad range of genres.",
          details: [
            "500+ anime watched, from classics to modern seasonal releases.",
            "Strong interest in character arcs, long-form storytelling, and pacing.",
            "Exploring direction styles, soundtrack design, and visual composition.",
            "Following seasonal releases while revisiting foundational classics.",
            "Writing short analysis pieces to unpack favorite scenes and themes.",
            "Collecting artbooks and studying key animation frames and techniques.",
          ],
        }),
      ];
    case 4:
      return [
        {
          left: (
            <>
              <h2>Let’s talk.</h2>
              <p className="sub">Open to internships, full-time roles and interesting projects.</p>
              <p>Based in Mumbai, India. Email is the fastest way to reach me.</p>
            </>
          ),
          right: (
            <>
              <h3>Email</h3>
              <p>
                <a href="mailto:nishchaykksinha@gmail.com">nishchaykksinha@gmail.com</a>
              </p>
              <h3>Phone</h3>
              <p>
                <a href="tel:+917887767971">+91-7887767971</a>
              </p>
              <h3>Elsewhere</h3>
              <p>LinkedIn · GitHub · Portfolio</p>
            </>
          ),
        },
      ];
    default:
      return [];
  }
}

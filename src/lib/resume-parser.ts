import type { ResumeData } from "@/types/portfolio";

/**
 * Local resume parser — extracts structured data from resume text
 * without requiring any external AI API.
 */
export function parseResumeLocally(text: string): ResumeData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const fullName = extractName(lines);
  const email = extractPattern(text, /[\w.-]+@[\w.-]+\.\w{2,}/);
  const phone = extractPattern(text, /\+?\d[\d\s()-]{7,}\d/);
  const linkedin = extractPattern(text, /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const github = extractPattern(text, /https?:\/\/(?:www\.)?github\.com\/[\w-]+/i);
  const website = extractPattern(text, /https?:\/\/(?!.*(?:linkedin|github))[\w.-]+\.\w{2,}[\w/]*/i);
  const location = extractLocation(text);
  const title = extractTitle(lines, text);
  const summary = extractSummary(text);
  const experiences = extractExperiences(text);
  const education = extractEducation(text);
  const skills = extractSkills(text);
  const projects = extractProjects(text);

  return {
    full_name: fullName,
    email: email || "",
    phone: phone || undefined,
    location: location || undefined,
    title,
    summary,
    linkedin_url: linkedin || undefined,
    github_url: github || undefined,
    website_url: website || undefined,
    experiences,
    education,
    projects,
    skills,
  };
}

function extractName(lines: string[]): string {
  // Name is usually the first non-empty line that looks like a name
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[|•·]/g, "").trim();
    // Skip lines that look like headers, emails, phones
    if (cleaned.includes("@") || cleaned.match(/^\+?\d/) || cleaned.length > 50) continue;
    if (cleaned.match(/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+$/) || cleaned.match(/^[A-Z\s]{4,}$/)) {
      return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  return lines[0]?.replace(/[|•·]/g, "").trim() || "Unknown";
}

function extractPattern(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[0] : null;
}

function extractLocation(text: string): string | null {
  // Look for common location patterns
  const patterns = [
    /(?:Location|Address|Based in)[:\s]*([A-Za-z\s,]+(?:India|USA|UK|Canada|Australia|Germany|France))/i,
    /\b((?:San Francisco|New York|London|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|Jaipur|Kolkata|India|USA|UK|Remote)[,\s]*(?:[A-Z]{2})?)\b/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1]?.trim() || m[0]?.trim();
  }
  // Check first few lines for location
  const headerLines = text.split("\n").slice(0, 5).join(" ");
  const locMatch = headerLines.match(/\b(India|USA|UK|Remote|[A-Z][a-z]+,\s*[A-Z]{2})\b/);
  return locMatch ? locMatch[1] : null;
}

function extractTitle(lines: string[], text: string): string {
  // Look for a professional title after the name
  const titlePatterns = [
    /(?:PROFESSIONAL\s+SYNOPSIS|SUMMARY|OBJECTIVE|PROFILE)\s*\n?\s*(.+?)(?:\.|with|\n)/i,
  ];
  for (const p of titlePatterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const title = m[1].trim();
      if (title.length < 80 && title.length > 5) return title;
    }
  }
  // Look for job titles in experience
  const roleMatch = text.match(/(?:Lead|Senior|Junior|Staff|Principal|Chief)?\s*(?:Gen\s?AI|AI|ML|Software|Full\s?Stack|Frontend|Backend|Data|Cloud|DevOps|Solution)\s+(?:Engineer|Developer|Architect|Scientist|Analyst)/i);
  if (roleMatch) return roleMatch[0].trim();
  return "Software Professional";
}

function extractSummary(text: string): string {
  const sections = [
    /(?:PROFESSIONAL\s+SYNOPSIS|SUMMARY|PROFILE|OBJECTIVE|ABOUT)\s*\n([\s\S]*?)(?=\n[A-Z\s]{5,}\n|\nTECHNICAL|PROFESSIONAL\s+EXPERIENCE|WORK|SKILLS)/i,
  ];
  for (const p of sections) {
    const m = text.match(p);
    if (m && m[1]) {
      return m[1].replace(/\s+/g, " ").trim().slice(0, 500);
    }
  }
  return "";
}

function extractExperiences(text: string): ResumeData["experiences"] {
  const experiences: ResumeData["experiences"] = [];

  // Find the experience section
  const expSection = text.match(
    /(?:PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE)\s*\n([\s\S]*?)(?=\nEDUCATION|\nCERTIFICATION|\nPROJECTS|\nSKILLS|\nAWARDS|$)/i
  );
  if (!expSection) return experiences;

  const expText = expSection[1];

  // Pattern: Company name + date on same or adjacent line, then role
  const expBlocks = expText.split(/\n(?=[A-Z][A-Za-z\s&.,]+(?:Pvt|Ltd|Inc|Corp|LLC|Technologies|Solutions|Cloud|Analytics)?[.\s]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}))/);

  for (const block of expBlocks) {
    if (block.trim().length < 20) continue;

    const blockLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    // Extract company name (first line usually)
    const companyLine = blockLines[0];
    const dateMatch = companyLine.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–]\s*(Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})/i);

    let company = companyLine;
    let startDate = "";
    let endDate = "";
    let isCurrent = false;

    if (dateMatch) {
      company = companyLine.replace(dateMatch[0], "").trim();
      startDate = dateMatch[1];
      endDate = dateMatch[2];
      isCurrent = endDate.toLowerCase() === "present";
    }

    company = company.replace(/[|•·\-–]+$/, "").trim();
    if (!company || company.length < 2) continue;

    // Extract role (usually second line)
    let role = "";
    if (blockLines.length > 1) {
      const roleLine = blockLines[1];
      // Role lines often start with a title
      if (!roleLine.startsWith("•") && !roleLine.startsWith("-") && roleLine.length < 80) {
        role = roleLine.replace(/[[\]]/g, "").trim();
      }
    }

    // Extract description bullets
    const bullets = blockLines
      .slice(role ? 2 : 1)
      .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("–"))
      .map((l) => l.replace(/^[•\-–]\s*/, "").trim())
      .slice(0, 5);

    const description = bullets.join(". ").slice(0, 500) || "";

    if (company) {
      experiences.push({
        company,
        role: role || "Software Engineer",
        start_date: startDate,
        end_date: isCurrent ? "" : endDate,
        description,
        is_current: isCurrent,
      });
    }
  }

  return experiences.slice(0, 8);
}

function extractEducation(text: string): ResumeData["education"] {
  const education: ResumeData["education"] = [];

  const eduSection = text.match(
    /EDUCATION\s*\n([\s\S]*?)(?=\nCERTIFICATION|\nPROJECTS|\nSKILLS|\nAWARDS|\nHOBBIES|$)/i
  );
  if (!eduSection) return education;

  const eduText = eduSection[1];
  const eduLines = eduText.split("\n").map((l) => l.trim()).filter(Boolean);

  let i = 0;
  while (i < eduLines.length) {
    const line = eduLines[i];
    const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/i);

    if (dateMatch || line.match(/(?:University|Institute|College|School|BITS|IIT|NIT)/i)) {
      let institution = line.replace(/\d{4}\s*[-–]\s*(?:\d{4}|Present)/gi, "").trim();
      const startDate = dateMatch?.[1] || "";
      const endDate = dateMatch?.[2] || "";

      let degree = "";
      let field = "";

      // Check next line for degree info
      if (i + 1 < eduLines.length) {
        const nextLine = eduLines[i + 1];
        const degreeMatch = nextLine.match(/(M\.?Tech|B\.?Tech|MBA|M\.?S\.?c?|B\.?S\.?c?|Ph\.?D|Bachelor|Master|Diploma)\s*[,.]?\s*(.*)/i);
        if (degreeMatch) {
          degree = degreeMatch[1];
          field = degreeMatch[2]?.replace(/[,|]/g, "").trim() || "";
          i++;
        } else if (!nextLine.match(/\d{4}/) && !nextLine.match(/(?:University|Institute)/i)) {
          degree = nextLine;
          i++;
        }
      }

      if (institution) {
        education.push({
          institution: institution.replace(/[,|]+$/, "").trim(),
          degree: degree || "Degree",
          field_of_study: field || "",
          start_date: startDate,
          end_date: endDate,
        });
      }
    }
    i++;
  }

  return education.slice(0, 5);
}

/**
 * Split skills string on commas/semicolons but keep parenthesized groups together.
 * E.g. "Azure (Container Apps, Bot Services, Synapse), Docker, Kubernetes"
 *   → ["Azure (Container Apps, Bot Services, Synapse)", "Docker", "Kubernetes"]
 */
function smartSplitSkills(raw: string): string[] {
  const results: string[] = [];
  let current = "";
  let depth = 0;
  for (const ch of raw) {
    if (ch === "(") { depth++; current += ch; }
    else if (ch === ")") { depth = Math.max(0, depth - 1); current += ch; }
    else if ((ch === "," || ch === ";") && depth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 1 && trimmed.length < 60) results.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }
  const last = current.trim();
  if (last.length > 1 && last.length < 60) results.push(last);
  return results;
}

function extractSkills(text: string): ResumeData["skills"] {
  const skills: ResumeData["skills"] = [];
  const seen = new Set<string>();

  const skillSection = text.match(
    /(?:TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES)\s*\n([\s\S]*?)(?=\n(?:PROFESSIONAL|WORK)\s+EXPERIENCE|\nPROJECTS|\nEDUCATION|$)/i
  );

  if (skillSection) {
    const skillText = skillSection[1];
    const skillLines = skillText.split("\n").filter(Boolean);

    for (const line of skillLines) {
      // Pattern: "Category: skill1, skill2, skill3"
      const catMatch = line.match(/^[•\-]?\s*([^:]+?):\s*(.+)/);
      if (catMatch) {
        const category = catMatch[1].trim();
        // Smart split: respect parentheses — e.g. "Azure (Container Apps, Bot Services)" stays together
        const items = smartSplitSkills(catMatch[2]);

        for (const item of items) {
          if (item && !seen.has(item.toLowerCase())) {
            seen.add(item.toLowerCase());
            skills.push({
              name: item,
              category: mapCategory(category),
              proficiency: estimateProficiency(item, text),
            });
          }
        }
      }
    }
  }

  // Fallback: extract known keywords across all domains
  if (skills.length === 0) {
    const techKeywords: Record<string, string> = {
      // Programming
      Python: "Programming", JavaScript: "Programming", TypeScript: "Programming", Java: "Programming",
      "C++": "Programming", "C#": "Programming", Go: "Programming", Rust: "Programming", PHP: "Programming",
      // Frontend / Design
      React: "Frontend", "Next.js": "Frontend", Vue: "Frontend", Angular: "Frontend",
      Figma: "Design", "Adobe XD": "Design", Photoshop: "Design", Illustrator: "Design",
      Canva: "Design", InDesign: "Design", Sketch: "Design",
      // Backend / DB
      "Node.js": "Backend", FastAPI: "Backend", Django: "Backend", Flask: "Backend",
      PostgreSQL: "Database", MongoDB: "Database", Redis: "Database", MySQL: "Database",
      // DevOps / Cloud
      Docker: "DevOps", Kubernetes: "DevOps", AWS: "Cloud", Azure: "Cloud", GCP: "Cloud",
      Git: "Tools", "CI/CD": "DevOps", Terraform: "DevOps",
      // AI/ML / Data
      PyTorch: "AI/ML", TensorFlow: "AI/ML", LangChain: "AI/ML",
      PySpark: "Data Engineering", Databricks: "Data Engineering", Tableau: "Analytics",
      "Power BI": "Analytics", Excel: "Analytics", "Google Analytics": "Analytics",
      // Marketing / Content
      SEO: "Marketing", SEM: "Marketing", HubSpot: "Marketing", Salesforce: "Marketing",
      Mailchimp: "Marketing", "Google Ads": "Marketing", "Facebook Ads": "Marketing",
      WordPress: "Content", Contentful: "Content",
      // Business / Finance
      "Financial Modeling": "Finance", Budgeting: "Finance", Forecasting: "Finance",
      "P&L": "Finance", "PowerPoint": "Tools & Software", "Microsoft Office": "Tools & Software",
      "Google Workspace": "Tools & Software", Notion: "Tools & Software", Jira: "Tools & Software",
      Confluence: "Tools & Software", Slack: "Tools & Software", Asana: "Tools & Software",
      Trello: "Tools & Software", Zoom: "Tools & Software",
      // Leadership / PM
      "Project Management": "Leadership", "Product Management": "Leadership",
      Agile: "Leadership", Scrum: "Leadership", "Stakeholder Management": "Leadership",
      // Communication
      "Public Speaking": "Communication", "Content Writing": "Communication",
      Copywriting: "Communication", "Technical Writing": "Communication",
    };

    for (const [tech, cat] of Object.entries(techKeywords)) {
      if (text.toLowerCase().includes(tech.toLowerCase()) && !seen.has(tech.toLowerCase())) {
        seen.add(tech.toLowerCase());
        skills.push({
          name: tech,
          category: cat,
          proficiency: estimateProficiency(tech, text),
        });
      }
    }
  }

  return skills.slice(0, 40);
}

function mapCategory(raw: string): string {
  const lower = raw.toLowerCase();
  // Technical
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("ml") || lower.includes("machine learning") || lower.includes("generative")) return "AI & ML";
  if (lower.includes("cloud") || lower.includes("devops") || lower.includes("infra")) return "Cloud & DevOps";
  if (lower.includes("data engineer") || lower.includes("big data") || lower.includes("pipeline")) return "Data Engineering";
  if (lower.includes("program") || lower.includes("coding") || lower.includes("development")) return "Programming";
  if (lower.includes("front") || lower.includes("ui") || lower.includes("ux")) return "Frontend & Design";
  if (lower.includes("back") || lower.includes("api") || lower.includes("server")) return "Backend";
  if (lower.includes("database") || lower.includes("sql") || lower.includes("nosql")) return "Database";
  if (lower.includes("security") || lower.includes("observ") || lower.includes("monitor")) return "Security & Ops";
  // Business / Non-technical
  if (lower.includes("market") || lower.includes("brand") || lower.includes("advertis") || lower.includes("seo") || lower.includes("campaign")) return "Marketing";
  if (lower.includes("analytic") || lower.includes("reporting") || lower.includes("insight") || lower.includes("tableau") || lower.includes("excel")) return "Analytics";
  if (lower.includes("financ") || lower.includes("account") || lower.includes("budget") || lower.includes("invest")) return "Finance";
  if (lower.includes("content") || lower.includes("writ") || lower.includes("copy") || lower.includes("blog") || lower.includes("editorial")) return "Content & Writing";
  if (lower.includes("design") || lower.includes("figma") || lower.includes("canva") || lower.includes("photo") || lower.includes("illustrat")) return "Design";
  if (lower.includes("sales") || lower.includes("crm") || lower.includes("hubspot") || lower.includes("salesforce")) return "Sales & CRM";
  if (lower.includes("project") || lower.includes("product") || lower.includes("agile") || lower.includes("scrum") || lower.includes("ops")) return "Product & Project Mgmt";
  if (lower.includes("leader") || lower.includes("manage") || lower.includes("strateg") || lower.includes("execut")) return "Leadership";
  if (lower.includes("communicat") || lower.includes("present") || lower.includes("speak") || lower.includes("negotiat")) return "Communication";
  if (lower.includes("tool") || lower.includes("software") || lower.includes("platform") || lower.includes("suite") || lower.includes("microsoft") || lower.includes("google")) return "Tools & Software";
  if (lower.includes("language") || lower.includes("lingual") || lower.includes("translat")) return "Languages";
  if (lower.includes("legal") || lower.includes("compliance") || lower.includes("regulat")) return "Legal & Compliance";
  if (lower.includes("hr") || lower.includes("recruit") || lower.includes("talent") || lower.includes("people")) return "HR & People";
  if (lower.includes("research") || lower.includes("academic") || lower.includes("publish")) return "Research";
  return raw.length > 30 ? raw.slice(0, 30) : raw;
}

function estimateProficiency(skill: string, fullText: string): number {
  const count = (fullText.toLowerCase().match(new RegExp(skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  if (count >= 5) return 95;
  if (count >= 3) return 90;
  if (count >= 2) return 85;
  return 75;
}

function extractProjects(text: string): ResumeData["projects"] {
  const projects: ResumeData["projects"] = [];

  const projSection = text.match(
    /PROJECTS?\s*\n([\s\S]*?)(?=\nEDUCATION|\nCERTIFICATION|\nSKILLS|\nAWARDS|$)/i
  );
  if (!projSection) return projects;

  const projText = projSection[1];
  const blocks = projText.split(/\n(?=[A-Z])/);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const name = lines[0].replace(/[•\-–|]/g, "").trim();
    if (name.length < 3 || name.length > 80) continue;

    const bullets = lines.slice(1).filter((l) => l.startsWith("•") || l.startsWith("-"));
    const description = bullets.map((b) => b.replace(/^[•\-]\s*/, "")).join(". ").slice(0, 300);

    const techMatch = block.match(/(?:Tech|Stack|Technologies|Built with)[:\s]*(.+)/i);
    const techStack = techMatch
      ? techMatch[1].split(/[,;|]/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 30)
      : [];

    projects.push({ name, description, tech_stack: techStack });
  }

  return projects.slice(0, 6);
}

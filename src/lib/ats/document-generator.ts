/**
 * Document Generator — produces ATS-compliant .docx and .pdf from OptimizedResume
 * DOCX: uses the `docx` npm package (pure JS)
 * PDF:  uses `pdfkit` (Node.js native)
 */

import type { OptimizedResume } from "./types";

// ─── DOCX Generation ─────────────────────────────────────────────────────────

export async function generateDocx(resume: OptimizedResume): Promise<Buffer> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, UnderlineType,
  } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [];

  const heading1 = (text: string) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" },
      },
    });

  const bullet = (text: string) =>
    new Paragraph({
      text: `• ${text}`,
      indent: { left: 360 },
      spacing: { before: 40, after: 40 },
      style: "Normal",
    });

  const body = (text: string, options: Record<string, unknown> = {}) =>
    new Paragraph({ children: [new TextRun({ text, ...options })] });

  // ── Contact ──
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resume.contact.name, bold: true, size: 36, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );

  const contactParts = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github,
    resume.contact.portfolio,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join("  |  "), size: 20, color: "444444" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // ── Summary ──
  if (resume.summary) {
    children.push(heading1("Professional Summary"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.summary, size: 22 })],
        spacing: { after: 120 },
      })
    );
  }

  // ── Skills ──
  if (resume.skills.length > 0) {
    children.push(heading1("Skills"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.skills.join(", "), size: 22 })],
        spacing: { after: 120 },
      })
    );
  }

  // ── Experience ──
  if (resume.experience.length > 0) {
    children.push(heading1("Experience"));
    for (const exp of resume.experience) {
      const dateStr = `${exp.start_date} – ${exp.end_date ?? "Present"}`;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.job_title}`, bold: true, size: 24 }),
            new TextRun({ text: `  —  ${exp.company}`, size: 24, color: "555555" }),
          ],
          spacing: { before: 160, after: 40 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.location ? `${dateStr}  |  ${exp.location}` : dateStr,
              italics: true,
              size: 20,
              color: "666666",
            }),
          ],
          spacing: { after: 80 },
        })
      );
      for (const b of exp.bullets) {
        children.push(bullet(b));
      }
    }
  }

  // ── Projects ──
  if (resume.projects.length > 0) {
    children.push(heading1("Projects"));
    for (const proj of resume.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title, bold: true, size: 24 }),
            ...(proj.tech_stack.length > 0
              ? [new TextRun({ text: `  |  ${proj.tech_stack.join(", ")}`, size: 22, color: "555555" })]
              : []),
          ],
          spacing: { before: 160, after: 40 },
        })
      );
      children.push(body(proj.description, { size: 22 }));
      for (const h of proj.highlights) {
        children.push(bullet(h));
      }
    }
  }

  // ── Education ──
  if (resume.education.length > 0) {
    children.push(heading1("Education"));
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}`, bold: true, size: 24 }),
            new TextRun({ text: `  —  ${edu.institution}`, size: 24, color: "555555" }),
            ...(edu.year ? [new TextRun({ text: `  (${edu.year})`, size: 22, color: "666666" })] : []),
          ],
          spacing: { before: 160, after: 60 },
        })
      );
      if (edu.gpa) {
        children.push(body(`GPA: ${edu.gpa}`, { size: 20, color: "555555" }));
      }
      if (edu.honors.length > 0) {
        children.push(body(edu.honors.join(", "), { size: 20, italics: true, color: "555555" }));
      }
    }
  }

  // ── Certifications ──
  if (resume.certifications.length > 0) {
    children.push(heading1("Certifications"));
    for (const cert of resume.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${cert.name}`, bold: true, size: 22 }),
            new TextRun({ text: `  —  ${cert.issuer}`, size: 22, color: "555555" }),
            ...(cert.date ? [new TextRun({ text: `  (${cert.date})`, size: 20, color: "666666" })] : []),
          ],
          spacing: { before: 80, after: 60 },
        })
      );
    }
  }

  // ── Languages / Achievements ──
  if (resume.languages.length > 0) {
    children.push(heading1("Languages"));
    children.push(body(resume.languages.join(", "), { size: 22 }));
  }

  if (resume.achievements.length > 0) {
    children.push(heading1("Achievements"));
    for (const a of resume.achievements) {
      children.push(bullet(a));
    }
  }

  // Suppress unused import warnings
  void UnderlineType;
  void AlignmentType;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

export async function generatePdf(resume: OptimizedResume): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 54,
      size: "letter",
      info: {
        Title: `${resume.contact.name} — Resume`,
        Author: resume.contact.name,
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - 108; // full text width (margins)
    const GRAY = "#444444";
    const LIGHT = "#888888";
    const BLACK = "#111111";
    const ACCENT = "#1a1a1a";

    const sectionHeader = (title: string) => {
      doc.moveDown(0.6);
      doc
        .fontSize(11)
        .fillColor(BLACK)
        .font("Helvetica-Bold")
        .text(title.toUpperCase(), { characterSpacing: 1.5 });
      doc
        .moveTo(doc.x, doc.y + 2)
        .lineTo(doc.x + W, doc.y + 2)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.3);
    };

    // ── Name & Contact ──
    doc
      .fontSize(22)
      .fillColor(BLACK)
      .font("Helvetica-Bold")
      .text(resume.contact.name, { align: "center" });

    const contactParts = [
      resume.contact.email,
      resume.contact.phone,
      resume.contact.location,
      resume.contact.linkedin,
    ].filter(Boolean);

    doc
      .moveDown(0.3)
      .fontSize(9)
      .fillColor(LIGHT)
      .font("Helvetica")
      .text(contactParts.join("  •  "), { align: "center" });

    doc
      .moveDown(0.4)
      .moveTo(54, doc.y)
      .lineTo(54 + W, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(0.5)
      .stroke()
      .moveDown(0.4);

    // ── Summary ──
    if (resume.summary) {
      sectionHeader("Professional Summary");
      doc
        .fontSize(10)
        .fillColor(GRAY)
        .font("Helvetica")
        .text(resume.summary, { lineGap: 2 });
    }

    // ── Skills ──
    if (resume.skills.length > 0) {
      sectionHeader("Skills");
      doc
        .fontSize(10)
        .fillColor(GRAY)
        .font("Helvetica")
        .text(resume.skills.join("  •  "), { lineGap: 2 });
    }

    // ── Experience ──
    if (resume.experience.length > 0) {
      sectionHeader("Experience");
      for (const exp of resume.experience) {
        const dateStr = `${exp.start_date} – ${exp.end_date ?? "Present"}`;
        doc
          .fontSize(11)
          .fillColor(BLACK)
          .font("Helvetica-Bold")
          .text(exp.job_title, { continued: true })
          .font("Helvetica")
          .fillColor(GRAY)
          .text(`  —  ${exp.company}`);

        doc
          .fontSize(9)
          .fillColor(LIGHT)
          .font("Helvetica-Oblique")
          .text(exp.location ? `${dateStr}  |  ${exp.location}` : dateStr);

        doc.moveDown(0.2);
        for (const b of exp.bullets) {
          doc
            .fontSize(10)
            .fillColor(GRAY)
            .font("Helvetica")
            .text(`• ${b}`, { indent: 12, lineGap: 1.5 });
        }
        doc.moveDown(0.4);
      }
    }

    // ── Projects ──
    if (resume.projects.length > 0) {
      sectionHeader("Projects");
      for (const proj of resume.projects) {
        const stackStr =
          proj.tech_stack.length > 0 ? `  |  ${proj.tech_stack.join(", ")}` : "";
        doc
          .fontSize(11)
          .fillColor(ACCENT)
          .font("Helvetica-Bold")
          .text(`${proj.title}${stackStr}`, { lineGap: 1 });
        doc
          .fontSize(10)
          .fillColor(GRAY)
          .font("Helvetica")
          .text(proj.description, { lineGap: 2 });
        for (const h of proj.highlights) {
          doc
            .fontSize(10)
            .fillColor(GRAY)
            .text(`• ${h}`, { indent: 12 });
        }
        doc.moveDown(0.4);
      }
    }

    // ── Education ──
    if (resume.education.length > 0) {
      sectionHeader("Education");
      for (const edu of resume.education) {
        const yearStr = edu.year ? `  (${edu.year})` : "";
        doc
          .fontSize(11)
          .fillColor(BLACK)
          .font("Helvetica-Bold")
          .text(`${edu.degree}${yearStr}`, { continued: true })
          .font("Helvetica")
          .fillColor(GRAY)
          .text(`  —  ${edu.institution}`);
        if (edu.gpa) {
          doc.fontSize(9).fillColor(LIGHT).text(`GPA: ${edu.gpa}`);
        }
        doc.moveDown(0.3);
      }
    }

    // ── Certifications ──
    if (resume.certifications.length > 0) {
      sectionHeader("Certifications");
      for (const cert of resume.certifications) {
        const dateStr = cert.date ? `  (${cert.date})` : "";
        doc
          .fontSize(10)
          .fillColor(BLACK)
          .font("Helvetica-Bold")
          .text(`${cert.name}`, { continued: true })
          .font("Helvetica")
          .fillColor(GRAY)
          .text(`  —  ${cert.issuer}${dateStr}`);
      }
    }

    // ── Languages & Achievements ──
    if (resume.languages.length > 0) {
      sectionHeader("Languages");
      doc.fontSize(10).fillColor(GRAY).font("Helvetica").text(resume.languages.join(", "));
    }

    if (resume.achievements.length > 0) {
      sectionHeader("Achievements");
      for (const a of resume.achievements) {
        doc.fontSize(10).fillColor(GRAY).font("Helvetica").text(`• ${a}`, { indent: 12 });
      }
    }

    doc.end();
  });
}

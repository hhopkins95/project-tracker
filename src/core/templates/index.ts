/**
 * Default templates for creating new workspace documents.
 * These templates follow the conventions from the project-tracker plugin.
 */

import { getCurrentDate } from "../services/markdown-parser";

export interface InitiativeTemplateData {
  title: string;
  goal: string;
  inScope?: string[];
  outOfScope?: string[];
  completionCriteria?: string[];
}

export interface SessionTemplateData {
  description: string;
  context?: string;
  completed?: string[];
  decisions?: string[];
  blockers?: string[];
  nextSteps?: string[];
  filesChanged?: string[];
  branch?: string;
}

export interface DecisionTemplateData {
  title: string;
  context: string;
  decision: string;
  rationale: string;
  alternatives?: Array<{ name: string; reason: string }>;
  consequences?: { positive?: string[]; negative?: string[] };
}

export interface TodoTemplateData {
  title: string;
  description: string;
}

export interface IdeaTemplateData {
  title: string;
  description: string;
  valueProposition?: string;
  initialThoughts?: string[];
}

// =============================================================================
// Initiative Template
// =============================================================================

export function generateInitiativeTemplate(data: InitiativeTemplateData): string {
  const lines: string[] = [
    `# ${data.title}`,
    "",
    "## Goal",
    "",
    data.goal,
    "",
  ];

  // Scope section
  lines.push("## Scope", "");

  lines.push("### In Scope", "");
  if (data.inScope && data.inScope.length > 0) {
    for (const item of data.inScope) {
      lines.push(`- ${item}`);
    }
  } else {
    lines.push("- *Define what's included*");
  }
  lines.push("");

  lines.push("### Out of Scope", "");
  if (data.outOfScope && data.outOfScope.length > 0) {
    for (const item of data.outOfScope) {
      lines.push(`- ${item}`);
    }
  } else {
    lines.push("- *Define what's excluded*");
  }
  lines.push("");

  // Completion criteria
  lines.push("## Completion Criteria", "");
  if (data.completionCriteria && data.completionCriteria.length > 0) {
    for (const criteria of data.completionCriteria) {
      lines.push(`- [ ] ${criteria}`);
    }
  } else {
    lines.push("- [ ] *Define measurable completion criteria*");
  }
  lines.push("");

  // Status sections
  lines.push("## Current Status", "", "*No updates yet*", "");
  lines.push("## Blockers", "", "*None*", "");
  lines.push("## Quick Links", "", "- Sessions: `./sessions/`", "");

  return lines.join("\n");
}

// =============================================================================
// Session Template
// =============================================================================

export function generateSessionTemplate(data: SessionTemplateData): string {
  const lines: string[] = [`# ${data.description}`, ""];

  if (data.context) {
    lines.push("## Context", "", data.context, "");
  }

  lines.push("## Completed", "");
  if (data.completed && data.completed.length > 0) {
    for (const item of data.completed) {
      lines.push(`- ${item}`);
    }
  } else {
    lines.push("- *List what was accomplished*");
  }
  lines.push("");

  if (data.decisions && data.decisions.length > 0) {
    lines.push("## Decisions Made", "");
    for (const item of data.decisions) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (data.blockers && data.blockers.length > 0) {
    lines.push("## Blockers / Open Questions", "");
    for (const item of data.blockers) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  lines.push("## Next Session", "");
  if (data.nextSteps && data.nextSteps.length > 0) {
    for (const item of data.nextSteps) {
      lines.push(`- [ ] ${item}`);
    }
  } else {
    lines.push("- [ ] *Define next steps*");
  }
  lines.push("");

  if (data.filesChanged && data.filesChanged.length > 0) {
    lines.push("## Files Changed", "");
    for (const file of data.filesChanged) {
      lines.push(`- \`${file}\``);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// =============================================================================
// Decision Template
// =============================================================================

export function generateDecisionTemplate(data: DecisionTemplateData): string {
  const lines: string[] = [
    `# ${data.title}`,
    "",
    "## Context",
    "",
    data.context,
    "",
    "## Decision",
    "",
    data.decision,
    "",
    "## Rationale",
    "",
    data.rationale,
    "",
  ];

  if (data.alternatives && data.alternatives.length > 0) {
    lines.push("## Alternatives Considered", "");
    for (const alt of data.alternatives) {
      lines.push(`### ${alt.name}`, "", alt.reason, "");
    }
  }

  if (data.consequences) {
    lines.push("## Consequences", "");
    if (data.consequences.positive && data.consequences.positive.length > 0) {
      lines.push("### Positive", "");
      for (const item of data.consequences.positive) {
        lines.push(`- ${item}`);
      }
      lines.push("");
    }
    if (data.consequences.negative && data.consequences.negative.length > 0) {
      lines.push("### Negative", "");
      for (const item of data.consequences.negative) {
        lines.push(`- ${item}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// =============================================================================
// Todo Template
// =============================================================================

export function generateTodoTemplate(data: TodoTemplateData): string {
  return [
    `# ${data.title}`,
    "",
    data.description,
    "",
    "## Notes",
    "",
    "*Add any additional context here*",
    "",
    "---",
    `*Created: ${getCurrentDate()}*`,
    "",
  ].join("\n");
}

// =============================================================================
// Idea Template
// =============================================================================

export function generateIdeaTemplate(data: IdeaTemplateData): string {
  const lines: string[] = [
    `# ${data.title}`,
    "",
    data.description,
    "",
  ];

  if (data.valueProposition) {
    lines.push("## Why This Could Be Valuable", "", data.valueProposition, "");
  }

  lines.push("## Initial Thoughts", "");
  if (data.initialThoughts && data.initialThoughts.length > 0) {
    for (const thought of data.initialThoughts) {
      lines.push(`- ${thought}`);
    }
  } else {
    lines.push("- *Capture initial considerations*");
  }
  lines.push("");

  lines.push("---", `*Captured: ${getCurrentDate()}*`, "");

  return lines.join("\n");
}

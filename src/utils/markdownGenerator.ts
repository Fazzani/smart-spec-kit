/**
 * Markdown Generator
 * 
 * Utilities for generating and filling Markdown templates with data
 */

/**
 * Placeholder pattern for template variables
 * Matches: [TO FILL], [TO FILL: description], {variable_name}
 */
const PLACEHOLDER_PATTERNS = {
  toFill: /\[TO FILL(?::\s*([^\]]+))?\]/g,
  variable: /\{(\w+)\}/g,
};

/**
 * Work item data from Azure DevOps
 */
export interface WorkItemData {
  id: number | string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  type?: string;
  state?: string;
  assignedTo?: string;
  tags?: string[];
  parentId?: number;
  childIds?: number[];
  links?: Array<{ rel: string; url: string }>;
  customFields?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Template fill options
 */
export interface FillOptions {
  /** Keep [TO FILL] placeholders for sections without data */
  keepPlaceholders?: boolean;
  /** Add a marker when data is auto-filled vs placeholder */
  markAutoFilled?: boolean;
  /** Custom date format */
  dateFormat?: string;
}

const DEFAULT_OPTIONS: FillOptions = {
  keepPlaceholders: true,
  markAutoFilled: false,
  dateFormat: "YYYY-MM-DD",
};

/**
 * Format a date according to the specified format
 */
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day);
}

/**
 * Extract a safe string value from potentially complex data
 */
function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(safeString).join(", ");
  }
  // For any other object type
  return JSON.stringify(value);
}

/**
 * Build a data map from work item for template filling
 */
function buildDataMap(workItem: WorkItemData, options: FillOptions): Record<string, string> {
  const now = new Date();
  const dateStr = formatDate(now, options.dateFormat ?? "YYYY-MM-DD");
  
  return {
    // Work item fields
    workitem_id: safeString(workItem.id),
    id: safeString(workItem.id),
    title: safeString(workItem.title),
    "Feature Title": safeString(workItem.title),
    description: safeString(workItem.description),
    acceptance_criteria: safeString(workItem.acceptanceCriteria),
    type: safeString(workItem.type),
    state: safeString(workItem.state),
    assigned_to: safeString(workItem.assignedTo),
    tags: safeString(workItem.tags),
    
    // Metadata
    Date: dateStr,
    date: dateStr,
    created: dateStr,
    last_updated: dateStr,
    
    // Azure DevOps link
    azure_devops_link: workItem.id 
      ? `[ADO #${workItem.id}](https://dev.azure.com/_workitems/edit/${workItem.id})`
      : "[TO FILL: Link to ADO Work Item]",
    
    // Context
    context_id: safeString(workItem.id),
  };
}

/**
 * Fill a template with work item data
 * 
 * @param template - The Markdown template string
 * @param workItem - Data from Azure DevOps work item
 * @param options - Fill options
 * @returns Filled template string
 */
export function fillTemplate(
  template: string,
  workItem: WorkItemData,
  options: Partial<FillOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const dataMap = buildDataMap(workItem, opts);
  
  let result = template;
  
  // Replace {variable} placeholders
  result = result.replaceAll(PLACEHOLDER_PATTERNS.variable, (match, varName: string) => {
    const value = dataMap[varName];
    if (value !== undefined && value !== "") {
      return opts.markAutoFilled ? `${value} <!--auto-filled-->` : value;
    }
    return opts.keepPlaceholders ? match : "";
  });
  
  // Replace [TO FILL: description] placeholders with matching data
  result = result.replaceAll(PLACEHOLDER_PATTERNS.toFill, (match, description?: string) => {
    if (!description) {
      return opts.keepPlaceholders ? match : "";
    }
    
    // Try to match description to data map keys
    const normalizedDesc = description.toLowerCase().replaceAll(/\s+/g, "_");
    const value = dataMap[normalizedDesc] ?? dataMap[description];
    
    if (value !== undefined && value !== "") {
      return opts.markAutoFilled ? `${value} <!--auto-filled-->` : value;
    }
    
    return opts.keepPlaceholders ? match : "";
  });
  
  return result;
}

/**
 * Extract all placeholders from a template
 */
export function extractPlaceholders(template: string): Array<{ type: string; value: string; description?: string }> {
  const placeholders: Array<{ type: string; value: string; description?: string }> = [];
  
  // Find [TO FILL] placeholders
  let match;
  const toFillRegex = new RegExp(PLACEHOLDER_PATTERNS.toFill.source, "g");
  while ((match = toFillRegex.exec(template)) !== null) {
    placeholders.push({
      type: "toFill",
      value: match[0],
      description: match[1],
    });
  }
  
  // Find {variable} placeholders
  const varRegex = new RegExp(PLACEHOLDER_PATTERNS.variable.source, "g");
  while ((match = varRegex.exec(template)) !== null) {
    placeholders.push({
      type: "variable",
      value: match[0],
      description: match[1],
    });
  }
  
  return placeholders;
}

/**
 * Generate frontmatter YAML from work item data
 */
export function generateFrontmatter(workItem: WorkItemData): string {
  const now = new Date();
  const dateStr = formatDate(now, "YYYY-MM-DD");
  
  const frontmatter = {
    title: workItem.title,
    workitem_id: workItem.id,
    type: workItem.type ?? "Specification",
    version: "1.0",
    status: "Draft",
    author: workItem.assignedTo ?? "[TO FILL]",
    created: dateStr,
    last_updated: dateStr,
    azure_devops_link: `https://dev.azure.com/_workitems/edit/${workItem.id}`,
    tags: workItem.tags ?? [],
  };
  
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else {
      lines.push(`${key}: "${value}"`);
    }
  }
  lines.push("---");
  
  return lines.join("\n");
}

/**
 * Create a specification document from template and work item
 */
export function createSpecification(
  template: string,
  workItem: WorkItemData,
  options: Partial<FillOptions> = {}
): string {
  // Update frontmatter if present
  const hasFrontmatter = template.startsWith("---");
  
  if (hasFrontmatter) {
    // Replace existing frontmatter
    const endIndex = template.indexOf("---", 3);
    if (endIndex !== -1) {
      const newFrontmatter = generateFrontmatter(workItem);
      const body = template.slice(endIndex + 3);
      return newFrontmatter + fillTemplate(body, workItem, options);
    }
  }
  
  // No frontmatter, just fill the template
  return fillTemplate(template, workItem, options);
}

/**
 * Summary of unfilled placeholders
 */
export function getUnfilledSummary(content: string): { count: number; items: string[] } {
  const placeholders = extractPlaceholders(content);
  const toFillItems = placeholders
    .filter((p) => p.type === "toFill")
    .map((p) => p.description ?? "Unspecified");
  
  return {
    count: toFillItems.length,
    items: [...new Set(toFillItems)], // Deduplicate
  };
}

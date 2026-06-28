import "server-only";

import fs from "fs/promises";
import path from "path";

export type CmsContentType = "blog" | "portfolio" | "job";

export type CmsEntry = {
  type: CmsContentType;
  lang: string;
  slug: string;
  frontmatter: Record<string, string>;
  body: string;
};

type ContentConfig = {
  dir: string;
  fieldOrder: string[];
  arrayFields?: string[];
  defaults: Record<string, string>;
  imageRoot?: string;
};

type FileWrite = {
  relativePath: string;
  content: string | Buffer;
};

type CmsDeleteTarget = {
  type: CmsContentType;
  lang: string;
  slug: string;
};

const projectRoot = process.cwd();

const contentConfigs: Record<CmsContentType, ContentConfig> = {
  blog: {
    dir: "content/blog",
    fieldOrder: ["title", "excerpt", "image", "date", "tags"],
    arrayFields: ["tags"],
    defaults: { title: "", excerpt: "", image: "", date: getToday(), tags: "" },
    imageRoot: "/images/posts",
  },
  portfolio: {
    dir: "content/portfolio",
    fieldOrder: ["title", "excerpt", "image", "date", "tag", "tone", "order"],
    defaults: { title: "", excerpt: "", image: "", date: getToday(), tag: "Project", tone: "blue", order: "" },
    imageRoot: "/images/portfolio",
  },
  job: {
    dir: "content/jobs",
    fieldOrder: ["title", "excerpt", "department", "country", "location", "workMode", "contract", "seniority", "status", "date"],
    defaults: {
      title: "",
      excerpt: "",
      department: "",
      country: "",
      location: "",
      workMode: "",
      contract: "",
      seniority: "",
      status: "open",
      date: getToday(),
    },
  },
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function assertContentType(type: string): asserts type is CmsContentType {
  if (!(type in contentConfigs)) {
    throw new Error(`Unsupported content type: ${type}`);
  }
}

function assertSafeSegment(value: string, label: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
}

export function slugify(value: string) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getContentDir(type: CmsContentType, lang: string) {
  assertSafeSegment(lang, "language");
  return path.join(projectRoot, contentConfigs[type].dir, lang);
}

function getContentPath(type: CmsContentType, lang: string, slug: string) {
  assertSafeSegment(slug, "slug");
  return path.join(getContentDir(type, lang), `${slug}.mdx`);
}

function getRepoRelativePath(type: CmsContentType, lang: string, slug: string) {
  assertSafeSegment(lang, "language");
  assertSafeSegment(slug, "slug");
  return path.posix.join(contentConfigs[type].dir, lang, `${slug}.mdx`);
}

function getPublicRelativePath(publicPath: string) {
  return path.posix.join("public", publicPath.replace(/^\/+/, ""));
}

function stripQuotes(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArrayValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean).join(", ");
      }
    } catch {
      return "";
    }
  }

  return trimmed;
}

export function parseCmsMdx(source: string) {
  if (!source.startsWith("---\n")) {
    return { frontmatter: {}, body: source };
  }

  const endIndex = source.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return { frontmatter: {}, body: source };
  }

  const block = source.slice(4, endIndex);
  const body = source.slice(endIndex + 5);
  const frontmatter: Record<string, string> = {};

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    frontmatter[key] = value.startsWith("[") ? parseArrayValue(value) : stripQuotes(value);
  }

  return { frontmatter, body };
}

function escapeYaml(value: string) {
  return String(value || "").replace(/"/g, '\\"');
}

function serializeArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `"${escapeYaml(item)}"`)
    .join(", ");
}

function serializeMdx(type: CmsContentType, frontmatter: Record<string, string>, body: string) {
  const config = contentConfigs[type];
  const lines = ["---"];

  for (const key of config.fieldOrder) {
    const value = frontmatter[key] ?? config.defaults[key] ?? "";

    if (key === "order" && !value) {
      continue;
    }

    if (config.arrayFields?.includes(key)) {
      lines.push(`${key}: [${serializeArray(value)}]`);
      continue;
    }

    lines.push(`${key}: "${escapeYaml(value)}"`);
  }

  lines.push("---", "");

  return `${lines.join("\n")}${body.trim()}\n`;
}

export function serializeCmsEntry(entry: CmsEntry) {
  assertContentType(entry.type);
  return serializeMdx(entry.type, { ...contentConfigs[entry.type].defaults, ...entry.frontmatter }, entry.body || "");
}

export function parseCmsMdxToEntry({ type, lang, slug, source }: { type: CmsContentType; lang: string; slug: string; source: string }) {
  assertContentType(type);
  const parsed = parseCmsMdx(source);

  return {
    type,
    lang,
    slug,
    frontmatter: { ...contentConfigs[type].defaults, ...parsed.frontmatter },
    body: parsed.body.trim(),
  } satisfies CmsEntry;
}

export async function getCmsEntry(typeInput: string, lang: string, slug: string) {
  assertContentType(typeInput);
  assertSafeSegment(lang, "language");
  assertSafeSegment(slug, "slug");

  try {
    const source = await fs.readFile(getContentPath(typeInput, lang, slug), "utf8");
    return parseCmsMdxToEntry({ type: typeInput, lang, slug, source });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export function isCmsEntryEmpty(entry: CmsEntry | null) {
  if (!entry) return true;

  const hasBody = Boolean(entry.body.trim());
  const hasTitle = Boolean((entry.frontmatter.title || "").trim());

  return !hasBody && !hasTitle;
}

function getEntryTime(entry: CmsEntry) {
  const rawDate = entry.frontmatter.date || "";
  const parsed = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isRemoteImage(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function inferImageExtension(url: string, contentType: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    // Fall through to content-type detection.
  }

  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("svg")) return ".svg";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";

  return ".jpg";
}

async function resolveRemoteImage({ type, slug, imageUrl }: { type: CmsContentType; slug: string; imageUrl: string }) {
  const imageRoot = contentConfigs[type].imageRoot;

  if (!imageRoot || !isRemoteImage(imageUrl)) {
    return { image: imageUrl, writes: [] as FileWrite[] };
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const extension = inferImageExtension(imageUrl, contentType);
  const publicPath = `${imageRoot}/${slug}${extension}`;
  const relativePath = getPublicRelativePath(publicPath);
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    image: publicPath,
    writes: [{ relativePath, content: buffer }],
  } satisfies { image: string; writes: FileWrite[] };
}

export async function listCmsEntries(typeInput: string, lang: string) {
  assertContentType(typeInput);
  const type = typeInput;
  const contentDir = getContentDir(type, lang);

  let files: string[];

  try {
    files = await fs.readdir(contentDir);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [] as CmsEntry[];
    }

    throw error;
  }

  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const source = await fs.readFile(path.join(contentDir, file), "utf8");
        const parsed = parseCmsMdx(source);

        return {
          type,
          lang,
          slug,
          frontmatter: { ...contentConfigs[type].defaults, ...parsed.frontmatter },
          body: parsed.body.trim(),
        } satisfies CmsEntry;
      }),
  );

  return entries.sort((left, right) => getEntryTime(right) - getEntryTime(left) || left.slug.localeCompare(right.slug));
}

export async function saveCmsEntry(input: CmsEntry) {
  const result = await commitCmsBatch({ upserts: [input], deletes: [] }, `cms: save ${input.type} ${input.lang}/${input.slug || input.frontmatter.title}`);
  return result.saved[0];
}

export async function deleteCmsEntry(typeInput: string, lang: string, slug: string) {
  assertContentType(typeInput);
  assertSafeSegment(lang, "language");
  assertSafeSegment(slug, "slug");

  await commitCmsBatch({ upserts: [], deletes: [{ type: typeInput, lang, slug }] }, `cms: delete ${typeInput} ${lang}/${slug}`);
}

function getGitHubConfig() {
  const owner = process.env.CMS_GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || "";
  const repo = process.env.CMS_GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || "";
  const branch = process.env.CMS_GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
  const token = process.env.CMS_GITHUB_TOKEN || "";
  const basePath = (process.env.CMS_GITHUB_BASE_PATH || "").replace(/^\/+|\/+$/g, "");

  return { owner, repo, branch, token, basePath, configured: Boolean(owner && repo && branch && token) };
}

function withBasePath(relativePath: string) {
  const { basePath } = getGitHubConfig();
  return basePath ? path.posix.join(basePath, relativePath) : relativePath;
}

async function getGitHubJson(pathname: string) {
  const github = getGitHubConfig();
  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${github.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function getGitHubRefSha(branch: string) {
  const github = getGitHubConfig();
  const data = await getGitHubJson(`/git/ref/heads/${encodeURIComponent(branch)}`);
  return typeof data?.object?.sha === "string" ? data.object.sha : "";
}

async function getGitHubCommitSha(commitSha: string) {
  const data = await getGitHubJson(`/git/commits/${encodeURIComponent(commitSha)}`);
  return typeof data?.tree?.sha === "string" ? data.tree.sha : "";
}

async function createGitHubBlob(content: string | Buffer) {
  const github = getGitHubConfig();
  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/git/blobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${github.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      content: (typeof content === "string" ? Buffer.from(content, "utf8") : content).toString("base64"),
      encoding: "base64",
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub blob creation failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return typeof data?.sha === "string" ? data.sha : "";
}

async function createGitHubTree(baseTreeSha: string, writes: FileWrite[], deletes: CmsDeleteTarget[]) {
  const github = getGitHubConfig();
  const tree: Array<{ path: string; mode: "100644"; type: "blob"; sha: string | null }> = [];

  for (const write of writes) {
    const sha = await createGitHubBlob(write.content);
    tree.push({ path: withBasePath(write.relativePath), mode: "100644", type: "blob", sha });
  }

  for (const deleteTarget of deletes) {
    tree.push({ path: withBasePath(getRepoRelativePath(deleteTarget.type, deleteTarget.lang, deleteTarget.slug)), mode: "100644", type: "blob", sha: null });
  }

  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/git/trees`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${github.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });

  if (!response.ok) {
    throw new Error(`GitHub tree creation failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return typeof data?.sha === "string" ? data.sha : "";
}

async function createGitHubCommit(treeSha: string, message: string, parentSha: string) {
  const github = getGitHubConfig();
  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/git/commits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${github.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
  });

  if (!response.ok) {
    throw new Error(`GitHub commit creation failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return typeof data?.sha === "string" ? data.sha : "";
}

async function updateGitHubRef(branch: string, commitSha: string) {
  const github = getGitHubConfig();
  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${github.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ sha: commitSha, force: false }),
  });

  if (!response.ok) {
    throw new Error(`GitHub ref update failed: ${response.status} ${await response.text()}`);
  }
}

async function prepareCmsEntryWrite(input: CmsEntry) {
  assertContentType(input.type);
  assertSafeSegment(input.lang, "language");

  const slug = slugify(input.slug || input.frontmatter.title);

  if (!slug) {
    throw new Error("Slug or title is required.");
  }

  const frontmatter = { ...contentConfigs[input.type].defaults, ...input.frontmatter };
  const resolvedImage = await resolveRemoteImage({
    type: input.type,
    slug,
    imageUrl: frontmatter.image || "",
  });

  frontmatter.image = resolvedImage.image;

  return {
    saved: { ...input, slug, frontmatter, body: input.body || "" } satisfies CmsEntry,
    writes: [
      ...resolvedImage.writes,
      {
        relativePath: getRepoRelativePath(input.type, input.lang, slug),
        content: serializeMdx(input.type, frontmatter, input.body || ""),
      },
    ],
  };
}

async function writeCmsBatchToDisk(writes: FileWrite[], deletes: CmsDeleteTarget[]) {
  for (const deleteTarget of deletes) {
    await fs.rm(path.join(projectRoot, getRepoRelativePath(deleteTarget.type, deleteTarget.lang, deleteTarget.slug)), { force: true });
  }

  for (const write of writes) {
    const diskPath = path.join(projectRoot, write.relativePath);
    await fs.mkdir(path.dirname(diskPath), { recursive: true });
    await fs.writeFile(diskPath, write.content);
  }
}

export async function commitCmsBatch(
  {
    upserts,
    deletes,
  }: {
    upserts: CmsEntry[];
    deletes: CmsDeleteTarget[];
  },
  message: string,
) {
  const prepared = [];
  const writes: FileWrite[] = [];

  for (const input of upserts) {
    const plan = await prepareCmsEntryWrite(input);
    prepared.push(plan.saved);
    writes.push(...plan.writes);
  }

  if (!writes.length && !deletes.length) {
    return { saved: prepared };
  }

  const github = getGitHubConfig();

  if (github.configured) {
    const headSha = await getGitHubRefSha(github.branch);
    if (!headSha) {
      throw new Error(`GitHub branch not found: ${github.branch}`);
    }

    const baseTreeSha = await getGitHubCommitSha(headSha);
    const treeSha = await createGitHubTree(baseTreeSha, writes, deletes);
    const commitSha = await createGitHubCommit(treeSha, message, headSha);
    await updateGitHubRef(github.branch, commitSha);
    return { saved: prepared };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("CMS_GITHUB_TOKEN, CMS_GITHUB_OWNER and CMS_GITHUB_REPO are required on Vercel.");
  }

  await writeCmsBatchToDisk(writes, deletes);
  return { saved: prepared };
}

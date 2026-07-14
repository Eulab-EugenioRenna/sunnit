import { createReadStream } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, '../..');

export const contentDefinitions = {
  blog: { dir: 'blog', sanityType: 'blogPost' },
  job: { dir: 'jobs', sanityType: 'job' },
  portfolio: { dir: 'portfolio', sanityType: 'portfolioProject' },
};

function parseEnv(source) {
  const values = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

export async function loadSanityEnv() {
  for (const name of ['.env', '.env.local']) {
    try {
      const values = parseEnv(await readFile(path.join(projectRoot, name), 'utf8'));
      for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch (error) {
      if (!error || error.code !== 'ENOENT') throw error;
    }
  }
}

export async function getSanityClient({ write = false } = {}) {
  await loadSanityEnv();
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';
  const token = write ? process.env.SANITY_WRITE_TOKEN || '' : process.env.SANITY_API_READ_TOKEN || process.env.SANITY_WRITE_TOKEN || '';

  const missing = [
    !projectId && 'NEXT_PUBLIC_SANITY_PROJECT_ID',
    !dataset && 'NEXT_PUBLIC_SANITY_DATASET',
    write && !token && 'SANITY_WRITE_TOKEN',
  ].filter(Boolean);

  if (missing.length) throw new Error(`Configurazione Sanity mancante: ${missing.join(', ')}`);

  return createClient({
    projectId,
    dataset,
    token: token || undefined,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-19',
    useCdn: false,
  });
}

export function deterministicDocumentId(type, language, slug) {
  return `${contentDefinitions[type].sanityType}.${language}.${slug}`.replace(/[^A-Za-z0-9_.-]/g, '-');
}

function toIsoDate(value, fallback) {
  const date = value ? new Date(value) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
}

function normalizeCountry(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['es', 'spain', 'espana', 'españa', 'spagna'].includes(normalized)) return 'es';
  return 'it';
}

export async function mdxFileToSanityDocument({ type, language, slug, filePath }) {
  const [source, stats] = await Promise.all([readFile(filePath, 'utf8'), stat(filePath)]);
  const parsed = matter(source);
  const data = parsed.data || {};
  const fallbackDate = Number.isNaN(stats.birthtime.getTime()) ? stats.mtime : stats.birthtime;
  const base = {
    _id: deterministicDocumentId(type, language, slug),
    _type: contentDefinitions[type].sanityType,
    title: String(data.title || slug),
    slug: { _type: 'slug', current: slug },
    language,
    excerpt: String(data.excerpt || ''),
    body: parsed.content.trim(),
  };

  if (type === 'blog') {
    return {
      ...base,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      imageUrl: String(data.image || ''),
      publishedAt: toIsoDate(data.date, fallbackDate),
    };
  }

  if (type === 'portfolio') {
    return {
      ...base,
      imageUrl: String(data.image || ''),
      tag: String(data.tag || 'Project'),
      tone: ['green', 'purple', 'dark'].includes(data.tone) ? data.tone : 'blue',
      order: Number(data.order) || 999,
      publishedAt: toIsoDate(data.date, fallbackDate),
    };
  }

  return {
    ...base,
    department: String(data.department || 'SUNNIT'),
    country: normalizeCountry(data.country),
    location: String(data.location || ''),
    workMode: String(data.workMode || ''),
    contract: String(data.contract || ''),
    seniority: String(data.seniority || ''),
    status: data.status === 'closed' ? 'closed' : 'open',
    publishedAt: toIsoDate(data.date, fallbackDate),
  };
}

export async function attachSanityImage(client, document, assetCache = new Map()) {
  if (!document.imageUrl || document._type === 'job') return document;

  const sourceValue = document.imageUrl;
  if (assetCache.has(sourceValue)) {
    return { ...document, image: { _type: 'image', asset: { _type: 'reference', _ref: assetCache.get(sourceValue) } } };
  }

  let uploadSource;
  let filename;
  if (/^https?:\/\//i.test(sourceValue)) {
    const response = await fetch(sourceValue);
    if (!response.ok) {
      console.warn(`Asset non caricato (${response.status}), mantengo imageUrl: ${sourceValue}`);
      return document;
    }
    uploadSource = Buffer.from(await response.arrayBuffer());
    filename = path.basename(new URL(sourceValue).pathname) || `${document.slug.current}.jpg`;
  } else {
    const localPath = path.join(projectRoot, 'public', sourceValue.replace(/^\/+/, ''));
    try {
      await access(localPath);
    } catch {
      console.warn(`Asset locale non trovato, mantengo imageUrl: ${sourceValue}`);
      return document;
    }
    uploadSource = createReadStream(localPath);
    filename = path.basename(localPath);
  }

  const asset = await client.assets.upload('image', uploadSource, { filename });
  assetCache.set(sourceValue, asset._id);
  return {
    ...document,
    image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
  };
}

export async function listSanityDocuments(client, type, language) {
  const sanityType = contentDefinitions[type].sanityType;
  return client.fetch(
    `*[_type == $type && (!defined($language) || language == $language)] | order(language asc, slug.current asc)`,
    { type: sanityType, language: language || null },
  );
}

export function sanityDocumentToMdx(document) {
  const shared = {
    title: document.title || '',
    excerpt: document.excerpt || '',
  };
  let data;

  if (document._type === 'blogPost') {
    data = { ...shared, image: document.imageUrl || '', date: document.publishedAt?.slice(0, 10) || '', tags: document.tags || [] };
  } else if (document._type === 'portfolioProject') {
    data = {
      ...shared,
      image: document.imageUrl || '',
      date: document.publishedAt?.slice(0, 10) || '',
      tag: document.tag || '',
      tone: document.tone || 'blue',
      ...(document.order === undefined ? {} : { order: document.order }),
    };
  } else {
    data = {
      ...shared,
      department: document.department || '',
      country: document.country || 'it',
      location: document.location || '',
      workMode: document.workMode || '',
      contract: document.contract || '',
      seniority: document.seniority || '',
      status: document.status || 'open',
      date: document.publishedAt?.slice(0, 10) || '',
    };
  }

  return matter.stringify(`${String(document.body || '').trim()}\n`, data);
}

export function mdxToSanityFields(source) {
  const parsed = matter(source);
  const fields = {
    title: String(parsed.data.title || ''),
    excerpt: String(parsed.data.excerpt || ''),
    body: parsed.content.trim(),
  };
  const missing = Object.entries(fields).filter(([, value]) => !value.trim()).map(([field]) => field);
  if (missing.length) {
    throw new Error(`Risposta Ollama non valida: campi mancanti (${missing.join(', ')})`);
  }
  return fields;
}

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;

// Return a complete, ordered model or null. Never mix partial CMS content with another locale.
export function normalizeEcosystemContent(value, template) {
  if (!object(value) || !object(value.copy) || !Array.isArray(value.departments)) return null;
  const copy = {};
  for (const key of Object.keys(template.copy)) {
    if (!nonEmpty(value.copy[key])) return null;
    copy[key] = value.copy[key];
  }
  if (value.departments.length !== template.departments.length) return null;
  const ids = value.departments.map(item => object(item) ? item.id : null);
  if (new Set(ids).size !== ids.length) return null;
  const departments = [];
  // The canonical slots determine icon and orbit position, independent of editor ordering.
  for (const slot of template.departments) {
    const item = value.departments.find(entry => entry?.id === slot.id);
    if (!object(item)) return null;
    for (const key of ['label', 'title', 'headline', 'description']) if (!nonEmpty(item[key])) return null;
    if (!Array.isArray(item.skills) || item.skills.length < 1 || item.skills.length > 8 || !item.skills.every(nonEmpty)) return null;
    if (!Array.isArray(item.projects) || item.projects.length < 1 || item.projects.length > 4) return null;
    if (new Set(item.projects.map(project => project?.title)).size !== item.projects.length) return null;
    const projects = [];
    for (const project of item.projects) {
      if (!object(project) || !['title', 'sector', 'description'].every(key => nonEmpty(project[key]))) return null;
      projects.push({ title: project.title, sector: project.sector, description: project.description });
    }
    departments.push({ id: slot.id, label: item.label, title: item.title, headline: item.headline, description: item.description, skills: [...item.skills], projects });
  }
  return { copy, departments };
}

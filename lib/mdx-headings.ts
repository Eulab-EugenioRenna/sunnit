type Node = { type: string; depth?: number; children?: Node[] };

// PageHero already supplies H1. Keep content headings below it without skipped levels.
export function normalizeMdxHeadings() {
  return (tree: Node) => {
    const headings: Node[] = [];
    function visit(node: Node) {
      if (node.type === "heading" && typeof node.depth === "number") headings.push(node);
      node.children?.forEach(visit);
    }
    visit(tree);
    const minimum = Math.min(...headings.map(node => node.depth!));
    let previous = 1;
    for (const node of headings) {
      const depth = Math.min(6, node.depth! - minimum + 2, previous + 1);
      node.depth = depth;
      previous = depth;
    }
  };
}

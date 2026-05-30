"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __domDebugInstalled?: boolean;
  }
}

function describeNode(node: Node | null | undefined) {
  if (!node) return "null";
  if (node.nodeType === Node.TEXT_NODE) {
    return `#text(${JSON.stringify(node.textContent?.trim().slice(0, 80) ?? "")})`;
  }
  if (!(node instanceof Element)) {
    return node.nodeName;
  }

  const tag = node.tagName.toLowerCase();
  const id = node.id ? `#${node.id}` : "";
  const className = typeof node.className === "string"
    ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 4).map((name) => `.${name}`).join("")
    : "";
  const data = node.getAttribute("data-label") || node.getAttribute("aria-label") || node.getAttribute("role");

  return `${tag}${id}${className}${data ? ` [${data}]` : ""}`;
}

function describeChain(node: Node | null | undefined) {
  const chain: string[] = [];
  let current = node;

  while (current && chain.length < 6) {
    chain.push(describeNode(current));
    current = current.parentNode;
  }

  return chain.join(" <- ");
}

export default function DebugDomErrors() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (window.__domDebugInstalled) return;
    window.__domDebugInstalled = true;

    const originalRemoveChild = Node.prototype.removeChild;

    Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(child: T) {
      try {
        return originalRemoveChild.call(this, child) as T;
      } catch (error) {
        console.group("[dom-debug] removeChild failed");
        console.error(error);
        console.log("parent:", describeNode(this));
        console.log("parent chain:", describeChain(this));
        console.log("child:", describeNode(child));
        console.log("child chain:", describeChain(child));
        console.log("contains child:", this.contains(child));
        console.trace("removeChild trace");
        console.groupEnd();
        throw error;
      }
    };

    return () => {
      Node.prototype.removeChild = originalRemoveChild;
      window.__domDebugInstalled = false;
    };
  }, []);

  return null;
}

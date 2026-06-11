"use client";

import { useState } from "react";

type ClientLogo = {
  name: string;
  url: string;
  logo: string;
};

function getLogoState(index: number, hoveredIndex: number | null) {
  if (hoveredIndex === null) return "is-idle";
  if (index === hoveredIndex) return "is-active";
  if (index === hoveredIndex - 1) return "is-neighbor-left";
  if (index === hoveredIndex + 1) return "is-neighbor-right";
  return "is-dimmed";
}

export default function LogoMarquee({ clients }: { clients: ClientLogo[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const loopedClients = [...clients, ...clients];

  return (
    <div
      className="logo-marquee"
      aria-label="Client logos"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className="logo-marquee__track">
        {loopedClients.map((client, index) => {
          const stateClass = getLogoState(index, hoveredIndex);
          const isDuplicate = index >= clients.length;

          return (
            <a
              className={`logo-pill ${stateClass}`}
              key={`${client.name}-${index}`}
              href={client.url}
              target="_blank"
              rel="noreferrer"
              aria-label={client.name}
              aria-hidden={isDuplicate}
              tabIndex={isDuplicate ? -1 : undefined}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
            >
              <span className="logo-pill__media">
                <img className="logo-pill__img logo-pill__img--base" src={client.logo} alt={client.name} />
                <img className="logo-pill__img logo-pill__img--color" src={client.logo} alt="" aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

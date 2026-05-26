"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, Landmark } from "lucide-react";

interface Office {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
}

export default function EuropeMap({ lang }: { lang: "en" | "it" }) {
  const [activeOffice, setActiveOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const offices: Office[] = [
    {
      id: "roma",
      name: lang === "en" ? "Rome (HQ)" : "Roma (HQ)",
      city: "Roma",
      address: "Via Stamira 63, 00162 Roma",
      phone: "+39 06 45251 300",
      email: "roma@sunnit.it",
      latitude: 41.9028,
      longitude: 12.4964
    },
    {
      id: "milano",
      name: "Milano",
      city: "Milano",
      address: "Via Tortona 35, 20144 Milano",
      phone: "+39 02 8940 1111",
      email: "milano@sunnit.it",
      latitude: 45.4642,
      longitude: 9.1900
    },
    {
      id: "padova",
      name: "Padova",
      city: "Padova",
      address: "Via Trieste 24, 35121 Padova",
      phone: "+39 049 827 5111",
      email: "padova@sunnit.it",
      latitude: 45.4064,
      longitude: 11.8768
    },
    {
      id: "valencia",
      name: "Valencia",
      city: "Valencia",
      address: "Carrer de Colón 8, 46004 Valencia",
      phone: "+34 963 51 01 00",
      email: "valencia@sunnit.es",
      latitude: 39.4699,
      longitude: -0.3763
    }
  ];

  useEffect(() => {
    let root: any;

    async function initChart() {
      try {
        // Dynamic imports to prevent Next.js SSR "window is not defined" error
        const [
          am5,
          am5map,
          am5geodata_europeLow,
          am5themes_Animated
        ] = await Promise.all([
          // @ts-ignore
          import("@amcharts/amcharts5"),
          // @ts-ignore
          import("@amcharts/amcharts5/map"),
          // @ts-ignore
          import("@amcharts/amcharts5-geodata/region/world/europeLow"),
          // @ts-ignore
          import("@amcharts/amcharts5/themes/Animated")
        ]);

        if (!chartRef.current) return;

        // Initialize Root element
        root = am5.Root.new(chartRef.current);

        // Remove amCharts watermark logo
        if ((root as any)._logo) {
          (root as any)._logo.dispose();
        }

        // Apply animated theme for smooth transitions
        root.setThemes([am5themes_Animated.default.new(root)]);

        // Create MapChart - Zoomed and focused on the active offices region (Spain/Italy)
        const chart = root.container.children.push(
          am5map.MapChart.new(root, {
            panX: "none",
            panY: "none",
            projection: am5map.geoMercator(),
            wheelY: "none",
            maxZoomLevel: 3.8,
            minZoomLevel: 3.8,
            homeGeoPoint: { latitude: 43.5, longitude: 6.0 },
            homeZoomLevel: 3.8
          })
        );

        // Create polygon series for European countries (strictly including requested landmasses)
        const polygonSeries = chart.series.push(
          am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_europeLow.default,
            include: ["IT", "ES", "PT", "FR", "CH", "DE", "AT", "GB", "BE", "NL", "LU"]
          })
        );

        // Style country shapes (landmasses)
        polygonSeries.mapPolygons.template.setAll({
          fill: am5.color(0x062d3c),
          fillOpacity: 0.04,
          stroke: am5.color(0x062d3c),
          strokeOpacity: 0.12,
          strokeWidth: 1.2
        });

        // Add subtle hover style on landmasses
        polygonSeries.mapPolygons.template.states.create("hover", {
          fillOpacity: 0.07,
          strokeOpacity: 0.22
        });

        // 1. Create Point Series for active offices and passive capital cities
        const pointSeries = chart.series.push(
          am5map.MapPointSeries.new(root, {})
        );

        // Define point styling using bullets
        pointSeries.bullets.push((bulletRoot: any, series: any, dataItem: any) => {
          const data = dataItem.dataContext;
          const container = am5.Container.new(bulletRoot, {
            centerX: am5.p50,
            centerY: am5.p50
          });

          if (data.isActive) {
            // Pulse Radar Animations for active uffici (non-interactive to avoid hover conflicts)
            const pulseCircle = container.children.push(
              am5.Circle.new(bulletRoot, {
                radius: 6,
                fill: am5.color(0xd85b47),
                fillOpacity: 0.35,
                strokeWidth: 0,
                interactive: false,
                centerX: am5.p50,
                centerY: am5.p50
              })
            );

            // Animate pulse scaling
            pulseCircle.animate({
              key: "scale",
              from: 1,
              to: 3.5,
              duration: 2200,
              loops: Infinity,
              easing: am5.ease.out(am5.ease.quad)
            });

            // Animate pulse fading
            pulseCircle.animate({
              key: "opacity",
              from: 0.6,
              to: 0,
              duration: 2200,
              loops: Infinity,
              easing: am5.ease.out(am5.ease.quad)
            });

            // Main Core Circle (non-interactive to avoid hover conflicts)
            const coreCircle = container.children.push(
              am5.Circle.new(bulletRoot, {
                radius: 5,
                fill: am5.color(0xd85b47),
                stroke: am5.color(0xffffff),
                strokeWidth: 1.8,
                interactive: false,
                centerX: am5.p50,
                centerY: am5.p50
              })
            );

            // Create hover animations on active dots (elastico bounce effect!)
            coreCircle.states.create("hover", {
              radius: 8,
              fill: am5.color(0xff4422)
            });

            // Transparent Hit Area for smooth hover (captures all pointer events)
            const hitAreaCircle = container.children.push(
              am5.Circle.new(bulletRoot, {
                radius: 18,
                fill: am5.color(0xffffff),
                fillOpacity: 0,
                interactive: true,
                cursorOverStyle: "pointer",
                centerX: am5.p50,
                centerY: am5.p50
              })
            );

            // Trigger react hover events for HTML glassmorphic tooltip & state animations!
            hitAreaCircle.events.on("pointerover", () => {
              coreCircle.states.applyAnimate("hover");
              const office = offices.find(o => o.id === data.id);
              if (office) setActiveOffice(office);
            });

            hitAreaCircle.events.on("pointerout", () => {
              coreCircle.states.applyAnimate("default");
              setActiveOffice(null);
            });

            // Render label text below the pin
            container.children.push(
              am5.Label.new(bulletRoot, {
                text: data.city,
                y: 12,
                centerX: am5.p50,
                fontSize: 10,
                fontWeight: "900",
                fill: am5.color(0x062d3c),
                fillOpacity: 0.75,
                populateText: true
              })
            );
          } else {
            // Reference passive capital nodes (tech grid nodes)
            container.children.push(
              am5.Circle.new(bulletRoot, {
                radius: 3,
                fill: am5.color(0x062d3c),
                fillOpacity: 0.22,
                strokeWidth: 0,
                centerX: am5.p50,
                centerY: am5.p50
              })
            );
          }

          return am5.Bullet.new(bulletRoot, {
            sprite: container
          });
        });

        // Set points data (only active offices, no passive gray capital dots)
        pointSeries.data.setAll([
          // Active offices
          { id: "roma", geometry: { type: "Point", coordinates: [12.4964, 41.9028] }, city: "Roma", isActive: true },
          { id: "milano", geometry: { type: "Point", coordinates: [9.1900, 45.4642] }, city: "Milano", isActive: true },
          { id: "padova", geometry: { type: "Point", coordinates: [11.8768, 45.4064] }, city: "Padova", isActive: true },
          { id: "valencia", geometry: { type: "Point", coordinates: [-0.3763, 39.4699] }, city: "Valencia", isActive: true }
        ]);

        // 2. Create Line Series for Connection Network Paths
        const lineSeries = chart.series.push(
          am5map.MapLineSeries.new(root, {})
        );

        // Customize lines styling (glow color + dashed)
        lineSeries.mapLines.template.setAll({
          stroke: am5.color(0xd85b47),
          strokeWidth: 1.6,
          strokeOpacity: 0.35,
          strokeDasharray: [6, 4]
        });

        // Set network lines coordinates
        lineSeries.data.setAll([
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-0.3763, 39.4699], // Valencia
                [9.1900, 45.4642]   // Milano
              ]
            }
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [9.1900, 45.4642],  // Milano
                [11.8768, 45.4064]  // Padova
              ]
            }
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [9.1900, 45.4642],  // Milano
                [12.4964, 41.9028]  // Roma
              ]
            }
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [11.8768, 45.4064], // Padova
                [12.4964, 41.9028]  // Roma
              ]
            }
          }
        ]);

        // Animate stroke dasharray in loop to create beautiful flowing network flow ("marching ants")
        lineSeries.mapLines.template.events.on("datavalidated", (ev: any) => {
          const line = ev.target;
          line.animate({
            key: "strokeDashoffset",
            from: 0,
            to: -20,
            duration: 1200,
            loops: Infinity,
            easing: am5.ease.linear
          });
        });

        // Disable loader once chart has loaded successfully
        setLoading(false);

      } catch (error) {
        console.error("Error loading amCharts 5:", error);
      }
    }

    initChart();

    return () => {
      // Clean up chart root instance to prevent memory leaks in React dev mode
      if (root) {
        root.dispose();
      }
    };
  }, []);

  return (
    <div className="europe-map-wrapper">
      {/* Interactive Map Label */}
      <div className="map-label">
        <Landmark size={14} />
        <span>{lang === "en" ? "SUNNIT European Offices" : "Sedi Europee SUNNIT"}</span>
      </div>

      <div className="europe-map-container">
        {/* Loading state skeleton to avoid layout jumps while loading amCharts canvas */}
        {loading && (
          <div className="map-skeleton">
            <div className="skeleton-glow"></div>
            <div className="skeleton-grid"></div>
            <div className="skeleton-text">
              {lang === "en" ? "Loading interactive network..." : "Caricamento rete interattiva..."}
            </div>
          </div>
        )}

        {/* Div where amCharts canvas is rendered */}
        <div 
          ref={chartRef} 
          id="chartdiv" 
          style={{ width: "100%", height: "100%" }}
        ></div>

        {/* Floating Glassmorphic Tooltip */}
        <div className={`office-tooltip ${activeOffice ? "visible" : ""}`}>
          {activeOffice ? (
            <>
              <h4>{activeOffice.name}</h4>
              <div className="tooltip-row">
                <MapPin size={12} className="tooltip-icon" />
                <span>{activeOffice.address}</span>
              </div>
              <div className="tooltip-row">
                <Phone size={12} className="tooltip-icon" />
                <span>{activeOffice.phone}</span>
              </div>
              <div className="tooltip-row">
                <Mail size={12} className="tooltip-icon" />
                <span>{activeOffice.email}</span>
              </div>
            </>
          ) : (
            <div className="tooltip-placeholder">
              {lang === "en" 
                ? "Hover over a city pin to view office details." 
                : "Passa col mouse sui pin delle città per i dettagli delle sedi."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

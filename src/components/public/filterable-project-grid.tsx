"use client";

import { useMemo, useState } from "react";
import { CardImage } from "@/components/public/card-image";
import type { ProjectCardDTO } from "@/types/public-pages";

export function FilterableProjectGrid({ projects }: { projects: ProjectCardDTO[] }) {
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const options = useMemo(() => ({
    types: [...new Set(projects.map((project) => project.projectType))].sort(),
    countries: [...new Set(projects.map((project) => project.country))].sort(),
  }), [projects]);
  const filtered = projects.filter((project) => (!type || project.projectType === type) && (!country || project.country === country));
  return (
    <section className="page-shell py-section">
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <select aria-label="Filter by project type" value={type} onChange={(event) => setType(event.target.value)} className="border border-charcoal/20 bg-ivory px-3 py-3">
          <option value="">All project types</option>
          {options.types.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select aria-label="Filter by country" value={country} onChange={(event) => setCountry(event.target.value)} className="border border-charcoal/20 bg-ivory px-3 py-3">
          <option value="">All countries</option>
          {options.countries.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => <CardImage key={project.id} href={`/projects/${project.slug}`} title={project.title} meta={`${project.projectType} / ${project.country} / ${project.year}`} image={project.coverImage} />)}
      </div>
    </section>
  );
}

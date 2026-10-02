import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { projectById, projects } from '@/data/projects';
import { ProjectTabs } from './ProjectTabs';
import { ProjectActions } from './ProjectActions';

// All project ids are known at build time; unknown ids get a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = projectById[id];
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.name} | Projects`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const project = projectById[id];
  if (!project) notFound();

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: project.name },
        ]}
        actions={
          <>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            <ProjectActions projectName={project.name} />
          </>
        }
      />
      <ProjectTabs project={project} />
    </div>
  );
}

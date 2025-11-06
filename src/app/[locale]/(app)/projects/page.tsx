import { PageContentLayout } from "@/components/layout/page-content-layout";
import { AddProject } from "@/components/projects/add-project";
import { ProjectsPageContent } from "@/components/projects/projects-page-content";

const ProjectsPage = async () => {
  return (
    <PageContentLayout title="Проекты" actions={<AddProject />}>
      <ProjectsPageContent />
    </PageContentLayout>
  );
};

export default ProjectsPage;

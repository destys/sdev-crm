import { ClientProps } from "./client.types";
import { MediaProps } from "./media.types";
import { ProjectStartusProps } from "./project-status.types";
import { TaskProps } from "./task.types";
import { UserProps } from "./user.types";

export interface ProjectProps {
  documentId: string;
  title: string;
  client: ClientProps;
  attachments: MediaProps[];
  assignees: UserProps;
  start_date: string;
  end_date?: string | null;
  project_status: ProjectStartusProps;
  tasks: TaskProps[];
}

export interface UpdateProjectDto {
  documentId: string;
  title: string;
  client: string;
  start_date: string;
  end_date?: string | null;
  project_status: ProjectStartusProps;
}

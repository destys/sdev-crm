import { MediaProps } from "./media.types";
import { UserProps } from "./user.types";

export interface ProjectStartusProps {
  documentId: string;
  title: string;
  client: UserProps;
  attachments: MediaProps[];
  assignees: UserProps;
  start_date: string;
  end_date: string;
  project_status: string;
}

export interface UpdateProjectStartusDto {
  documentId: string;
}

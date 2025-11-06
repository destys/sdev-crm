import { ProjectProps } from "./project.types";

export interface TaskProps {
  documentId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  projects: ProjectProps[];
}

export interface UpdateTaskDto {
  documentId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
}

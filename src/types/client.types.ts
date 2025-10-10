import { ProjectProps } from "./project.types";

export interface ClientProps {
  documentId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  projects: ProjectProps[];
}

export interface UpdateClientDto {
  documentId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
}

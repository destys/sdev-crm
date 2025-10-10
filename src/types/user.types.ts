import { MediaProps } from "./media.types";

export interface UserProps {
  full_name: string;
  email: string;
  avatar?: MediaProps;
}

import { Profile } from "../enum/profile.enum";
import { components } from "../schema";

export type ProfileEnum = keyof typeof Profile;

export type ProfileSchema = components["schemas"]["Profile"];

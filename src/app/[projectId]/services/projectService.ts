import { UserRole } from "@/src/types/project";

export async function fetchUserRole(_projectId: string): Promise<UserRole> {
    return 'scrum_master';
}

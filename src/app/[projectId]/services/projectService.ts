import { UserRole } from "@/src/types/project";

type ApiProjectMe = { id: number; papel: string };

export async function fetchUserRole(projectId: string, token: string): Promise<UserRole> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/me`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return 'member';
    const projects: ApiProjectMe[] = await res.json();
    const project = projects.find(p => String(p.id) === projectId);
    if (!project) return 'member';
    if (project.papel === 'scrum_master') return 'scrum_master';
    if (project.papel === 'product_owner') return 'product_owner';
    return 'member';
}

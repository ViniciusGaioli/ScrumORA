"use client";
import styles from "./Page.module.css"
import { Header } from "@/src/app/components/Header/Header";
import { SectionIntro } from "@/src/app/components/Header/SectionIntro/SectionIntro";
import { StatCard } from "./_components/StatCard/StatCard";
import { ProjectSearchBar } from "./_components/ProjectsSearchBar/ProjectSearchBar";
import { FilterChipGroup } from "./_components/FilterChipGroup/FilterChipGroup";
import { ProjectCardGroup } from "./_components/ProjectCardGroup/ProjectCardGroup";
import { CreateProjectModal } from "./_components/CreateProjectModal/CreateProjectModal";
import { EditProjectModal } from "./_components/EditProjectModal/EditProjectModal";
import { Project } from "@/src/types/project";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type ApiProject = {
    id: number;
    nome: string;
    descricao: string;
    papel: string;
    progress: number;
    atividadesAbertas: number;
    membros: { id: number; name: string; initials: string }[];
    activeSprint?: { id: number; nome: string; ativa: boolean };
};

function mapProject(p: ApiProject): Project & { atividadesAbertas: number } {
    return {
        id: String(p.id),
        name: p.nome,
        description: p.descricao,
        role: (p.papel === 'developer' ? 'member' : p.papel) as Project['role'],
        progress: p.progress,
        atividadesAbertas: p.atividadesAbertas,
        members: p.membros.map(m => ({ ...m, id: String(m.id) })),
        activeSprint: p.activeSprint
            ? { id: String(p.activeSprint.id), name: p.activeSprint.nome, status: p.activeSprint.ativa }
            : undefined,
    };
}

type ProjectWithStats = Project & { atividadesAbertas: number };

export default function myProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectWithStats[]>([]);
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState<{ project: ProjectWithStats; tab: 'edit' | 'share' | 'delete' } | null>(null);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchProjects = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) { router.replace('/auth/login'); return; }

        setUserName(localStorage.getItem('userName') ?? '');

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then((data) => {
                if (!Array.isArray(data)) return;
                setProjects(data.map(mapProject));
            });
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const totalProjetos = projects.length;
    const sprintAtiva = projects.filter(p => p.activeSprint).length;
    const atividadesAbertas = projects.reduce((sum, p) => sum + p.atividadesAbertas, 0);
    const smPoCount = projects.filter(p => p.role === 'scrum_master' || p.role === 'product_owner').length;

    const roleMap: Record<string, string> = { sm: 'scrum_master', po: 'product_owner', member: 'member' };
    const filteredProjects = projects.filter(p => {
        const matchesRole = activeFilter === 'all' || p.role === roleMap[activeFilter];
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const filterOptions = [
        { value: 'all',    label: 'Todos'         },
        { value: 'sm',     label: 'Scrum Master'  },
        { value: 'po',     label: 'Product Owner' },
        { value: 'member', label: 'Integrante'    },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <Header title="Meus projetos" onSearch={() => console.log('buscar')} onNewProject={() => setShowModal(true)}/>
                <main className={styles.main}>
                    <div className={styles.inner}>
                        <SectionIntro greeting={`Olá, ${userName}`} title="Escolha um" highlight="projeto"/>
                        <div className={styles.statsRow}>
                            <StatCard label="Total de projetos" value={totalProjetos} sub={`${sprintAtiva} com sprint ativa`} showActiveDot />
                            <StatCard label="Atividades abertas" value={atividadesAbertas} sub="em todos os projetos" />
                            <StatCard label="Projetos como SM / PO" value={smPoCount} sub={`de ${totalProjetos} projetos`} />
                        </div>
                        <div className={styles.searchRow}>
                            <ProjectSearchBar placeholder="Buscar projeto..." value={search} onChange={setSearch}/>
                            <FilterChipGroup options={filterOptions} defaultValue="all" onChange={setActiveFilter}/>
                        </div>
                        <ProjectCardGroup
                            projects={filteredProjects}
                            onProjectClick={(p) => router.push(`/${p.id}/activities`)}
                            onProjectMenuClick={(p, action) => setEditProject({ project: p as ProjectWithStats, tab: action })}
                            onNewProject={() => setShowModal(true)}
                        />
                    </div>
                </main>
            </div>

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onRefresh={fetchProjects}
                />
            )}

            {editProject && (
                <EditProjectModal
                    project={editProject.project}
                    initialTab={editProject.tab}
                    onClose={() => setEditProject(null)}
                    onRefresh={fetchProjects}
                />
            )}
        </div>
    );
}

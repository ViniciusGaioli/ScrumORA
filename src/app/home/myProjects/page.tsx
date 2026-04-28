"use client";
import styles from "./Page.module.css"
import { Header } from "@/src/app/components/Header/Header";
import { SectionIntro } from "@/src/app/components/Header/SectionIntro/SectionIntro";
import { StatCard } from "./_components/StatCard/StatCard";
import { ProjectSearchBar } from "./_components/ProjectsSearchBar/ProjectSearchBar";
import { FilterChipGroup } from "./_components/FilterChipGroup/FilterChipGroup";
import { ProjectCardGroup } from "./_components/ProjectCardGroup/ProjectCardGroup";
import { Project } from "@/src/types/project";

import { useState, useEffect } from "react";

export default function myProjects() {
    const mockProjects: Project[] = [
        {
            id: '1',
            name: 'Plataforma Agendamento',
            description: 'Sistema web para gestão de agendamentos e reservas com integração de pagamentos.',
            role: 'scrum_master',
            progress: 68,
            activeSprint: { id: '1', name: 'Sprint 3', status: true },
            members: [
                { id: '1', name: 'Vinicius Gaioli', initials: 'VG' },
                { id: '2', name: 'Rafael Alves',    initials: 'RA' },
                { id: '3', name: 'Julia Matos',     initials: 'JM' },
                { id: '4', name: 'Carlos Lima',     initials: 'CL' },
            ],
        },
        {
            id: '2',
            name: 'App de Delivery',
            description: 'Aplicativo mobile para pedidos e rastreamento de entregas em tempo real.',
            role: 'product_owner',
            progress: 42,
            activeSprint: { id: '2', name: 'Sprint 1', status: true },
            members: [
                { id: '5', name: 'Ana Souza',       initials: 'AS' },
                { id: '6', name: 'Bruno Costa',     initials: 'BC' },
                { id: '7', name: 'Mariana Ferreira',initials: 'MF' },
            ],
        },
        {
            id: '3',
            name: 'Portal RH Interno',
            description: 'Portal para gestão de férias, ponto eletrônico e benefícios dos colaboradores.',
            role: 'member',
            progress: 91,
            members: [
                { id: '8',  name: 'Lucas Prado',    initials: 'LP' },
                { id: '9',  name: 'Fernanda Ramos', initials: 'FR' },
            ],
        },
        {
            id: '4',
            name: 'E-commerce Moda',
            description: 'Loja virtual com catálogo dinâmico, carrinho e checkout integrado ao ERP.',
            role: 'scrum_master',
            progress: 15,
            activeSprint: { id: '3', name: 'Sprint 2', status: true },
            members: [
                { id: '10', name: 'Thiago Nunes',   initials: 'TN' },
                { id: '11', name: 'Camila Dias',    initials: 'CD' },
                { id: '12', name: 'Pedro Henrique', initials: 'PH' },
                { id: '13', name: 'Isabela Torres', initials: 'IT' },
                { id: '14', name: 'Rodrigo Melo',   initials: 'RM' },
            ],
        },
        {
            id: '5',
            name: 'Dashboard Analytics',
            description: 'Painel de métricas e relatórios para acompanhamento de KPIs de negócio.',
            role: 'product_owner',
            progress: 57,
            activeSprint: { id: '4', name: 'Sprint 4', status: true },
            members: [
                { id: '15', name: 'Gabriela Lima',  initials: 'GL' },
                { id: '16', name: 'Henrique Rocha', initials: 'HR' },
            ],
        },
        {
            id: '6',
            name: 'Sistema de Chamados',
            description: 'Ferramenta interna de suporte técnico com triagem automática e SLA configurável.',
            role: 'member',
            progress: 33,
            members: [
                { id: '17', name: 'Natalia Campos', initials: 'NC' },
                { id: '18', name: 'Eduardo Farias', initials: 'EF' },
                { id: '19', name: 'Leticia Vaz',    initials: 'LV' },
            ],
        },
    ];

    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('User ID:', payload.sub);
        }
    }, []);

    const filterOptions = [
        { value: 'all',      label: 'Todos'        },
        { value: 'sm',       label: 'Scrum Master' },
        { value: 'po',   label: 'Product Owner'   },
        { value: 'member',   label: 'Integrante'   },
    ];
    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <Header title="Meus projetos" onSearch={() => console.log('buscar')} onNewProject={() => console.log('novo projeto')}/>
                <main className={styles.main}>
                    <div className={styles.inner}>
                        <SectionIntro greeting="Olá, Vinicius" title="Escolha um" highlight="projeto"/>
                        <div className={styles.statsRow}>
                            <StatCard label="Total de projetos" value={4} sub="2 com sprint ativa" showActiveDot />
                            <StatCard label="Atividades abertas" value={23} sub="em todos os projetos" />
                            <StatCard label="Meu papel principal" value="SM / PO" sub="em 2 projetos" />
                        </div>
                        <div className={styles.searchRow}>
                            <ProjectSearchBar placeholder="Buscar projeto..." value={search} onChange={setSearch}/>
                            <FilterChipGroup options={filterOptions} defaultValue="all" onChange={(value) => console.log(value)}/>
                        </div>
                        <ProjectCardGroup
                            projects={mockProjects}
                            onProjectClick={(p) => console.log('abrir', p.id)}
                            onProjectMenuClick={(p) => console.log('menu', p.id)}
                            onNewProject={() => console.log('novo projeto')}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
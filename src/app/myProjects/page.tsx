"use client";
import styles from "./Page.module.css"
import { Sidebar } from "../componentes/Sidebar/Sidebar";
import { Header } from "../componentes/Header/Header";
import { StatCard } from "../componentes/StatCard/StatCard";
import { SectionIntro } from "../componentes/Header/SectionIntro/SectionIntro";
import { ProjectSearchBar } from "../componentes/ProjectsSearchBar/ProjectSearchBar";
import { FilterChipGroup } from "../componentes/FilterChipGroup/FilterChipGroup";


import { useState } from "react";

export default function myProjects() {
    const [search, setSearch] = useState('');

    const filterOptions = [
        { value: 'all',      label: 'Todos'        },
        { value: 'sm',       label: 'Scrum Master' },
        { value: 'po',   label: 'Product Owner'   },
        { value: 'member',   label: 'Integrante'   },
    ];
    return (
        <div className={styles.page}>
            <Sidebar activePage="projects" userInitials="VG" onNavigate={(page) => console.log(page)} onLogout={() => console.log('logout')}/>
            <div className={styles.content}>
                <Header title="Meus projetos" onSearch={() => console.log('buscar')} onNewProject={() => console.log('novo projeto')}/>
                <main className={styles.main}>
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
                </main>
            </div>
        </div>
    );
}
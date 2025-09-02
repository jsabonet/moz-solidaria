import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublicProjects, fetchProjectCategories } from "@/lib/api";

interface SimpleProject {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  featured_image?: string;
  program?: { id: number; name: string };
  category?: { id: number; name: string };
  province?: string;
  location?: string;
  status?: string;
  is_public?: boolean;
}

const Projects = () => {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>("Todos");
  const [province, setProvince] = useState<string>("Todos");
  const [status, setStatus] = useState<string>("Todos");
  const [q, setQ] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPublicProjects();
        // normalize minimal shape
        const normalized = (res || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          short_description: p.short_description,
          featured_image: p.featured_image,
          program: p.program,
          category: p.category,
          province: p.province || p.location || "",
          location: p.location,
          status: p.status,
          is_public: p.is_public,
        }));
        setProjects(normalized);
      } catch (e) {
        console.error('Erro ao carregar projetos públicos', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // categories list from API (best effort)
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await fetchProjectCategories();
        if (!mounted) return;
        if (Array.isArray(cats)) setCategoriesList(['Todos', ...cats.map((c:any)=>c.name).filter(Boolean)]);
      } catch (e) {
        // fallback: extract from loaded projects
        if (projects.length > 0) {
          const c = Array.from(new Set(projects.map(p => p.category?.name).filter(Boolean)));
          setCategoriesList(['Todos', ...c]);
        }
      }
    })();
    return () => { mounted = false };
  }, [projects]);

  const provinces = useMemo(() => ['Todos', ...Array.from(new Set(projects.map(p => p.province).filter(Boolean)))], [projects]);
  const statuses = ['Todos', 'active', 'completed', 'planning', 'suspended'];

  const filtered = useMemo(() => {
    let list = projects.slice();
    if (category && category !== 'Todos') list = list.filter(p => (p.category?.name || p.program?.name) === category);
    if (province && province !== 'Todos') list = list.filter(p => (p.province || '').toLowerCase() === province.toLowerCase());
    if (status && status !== 'Todos') list = list.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
    if (q && q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(qq) || (p.short_description || '').toLowerCase().includes(qq));
    }
    return list.filter(p => p.is_public);
  }, [projects, category, province, status, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=>{ if (page > totalPages) setPage(1); }, [totalPages]);

  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Projetos - MOZ SOLIDÁRIA"
        description="Lista de todos os projetos públicos da MOZ SOLIDÁRIA"
        keywords="projetos, moz solidaria, cabo delgado, projetos sociais"
        type="website"
        image="/logo-moz-solidaria.png"
      />
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">Explore os projetos apoiados pela MOZ SOLIDÁRIA.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Mostrar por página:</label>
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1)}} className="border rounded px-2 py-1">
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <input
            value={q}
            onChange={e=>{setQ(e.target.value); setPage(1)}}
            placeholder="Buscar por nome ou descrição"
            className="col-span-1 sm:col-span-2 border rounded px-3 py-2"
          />
          <select value={category} onChange={e=>{setCategory(e.target.value); setPage(1)}} className="border rounded px-3 py-2">
            {categoriesList.map((c,i)=>(<option key={i} value={c}>{c}</option>))}
          </select>
          <select value={province} onChange={e=>{setProvince(e.target.value); setPage(1)}} className="border rounded px-3 py-2">
            {provinces.map((p,i)=>(<option key={i} value={p}>{p}</option>))}
          </select>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Carregando projetos...</div>
          ) : current.length === 0 ? (
            <div className="col-span-full text-center py-12">Nenhum projeto encontrado.</div>
          ) : (
            current.map(p => (
              <div key={p.id} className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <Link to={`/projeto/${p.slug}`} className="block">
                  <div className="h-44 w-full bg-gray-100 overflow-hidden">
                    <img src={p.featured_image || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover" onError={(e:any)=>{e.target.src='/placeholder.svg'}} />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/projeto/${p.slug}`} className="text-lg font-semibold hover:text-primary">{p.name}</Link>
                  <p className="text-sm text-muted-foreground mt-2">{p.short_description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{p.province || p.location}</div>
                    <div className="text-xs font-medium">{p.status}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">Mostrando {filtered.length === 0 ? 0 : ((page-1)*pageSize)+1}–{Math.min(page*pageSize, filtered.length)} de {filtered.length} resultados</div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
            <div className="flex items-center gap-1">
              {Array.from({length: totalPages}).map((_,i)=>{
                const num = i+1;
                if (totalPages > 7) {
                  // show condensed pagination
                  if (num === 1 || num === totalPages || (num>=page-1 && num<=page+1)) {
                    return <button key={num} onClick={()=>setPage(num)} className={`px-2 py-1 border rounded ${num===page? 'bg-primary text-white':''}`}>{num}</button>
                  }
                  if (num === 2 && page>4) return <span key={num}>...</span>
                  if (num === totalPages-1 && page< totalPages-3) return <span key={num}>...</span>
                  return null;
                }
                return <button key={num} onClick={()=>setPage(num)} className={`px-2 py-1 border rounded ${num===page? 'bg-primary text-white':''}`}>{num}</button>
              })}
            </div>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Próxima</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;

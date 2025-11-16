const API = "http://localhost:3000/lugares";

async function fetchLugares(){
  const r = await fetch(API);
  if(!r.ok) throw new Error("Erro ao buscar lugares");
  return await r.json();
}

async function criarLugar(payload){
  const r = await fetch(API, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  return await r.json();
}

async function atualizarLugar(id, payload){
  const r = await fetch(`${API}/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  return await r.json();
}

async function excluirLugar(id){
  const r = await fetch(`${API}/${id}`, { method:"DELETE" });
  return r.ok;
}

// export globals for browser console or other pages (if needed)
window.api = { fetchLugares, criarLugar, atualizarLugar, excluirLugar };

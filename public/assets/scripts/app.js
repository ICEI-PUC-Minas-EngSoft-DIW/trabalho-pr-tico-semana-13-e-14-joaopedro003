const API = "http://localhost:3000/lugares";
const cardsRow = document.getElementById("cardsRow");
const btnNovo = document.getElementById("btnNovo");
const modalFormEl = new bootstrap.Modal(document.getElementById("modalForm"));
const modalDetalheEl = new bootstrap.Modal(document.getElementById("modalDetalhe"));
const form = document.getElementById("formDestino");
const search = document.getElementById("search");
let lugaresCache = [];

async function fetchLugares(){
  try{
    const r = await fetch(API);
    if(!r.ok) throw new Error("fetch");
    const data = await r.json();
    lugaresCache = data;
    renderCards(data);
  }catch{
    lugaresCache = [];
    renderCards([]);
  }
}

function renderCards(list){
  const q = (search.value || "").toLowerCase();
  const filtered = list.filter(l => l.nome.toLowerCase().includes(q) || l.pais.toLowerCase().includes(q) || (l.descricao || "").toLowerCase().includes(q));
  cardsRow.innerHTML = filtered.map(l => `
    <div class="card-destino">
      <img src="${l.imagem_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop'}" alt="${l.nome}">
      <div class="card-body-brief">
        <h5>${l.nome}</h5>
        <p>${l.descricao ? (l.descricao.length>120? l.descricao.slice(0,120)+"..." : l.descricao) : ""}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="bad-epoca">${l.melhor_epoca || 'Melhor época: variável'}</span>
          <div>
            <button class="btn btn-outline-primary btn-sm me-2" onclick="abrirDetalhe(${l.id})">Ver</button>
            <button class="btn btn-outline-success btn-sm" onclick="abrirEditar(${l.id})">Editar</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

btnNovo.addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "Novo destino";
  form.reset();
  document.getElementById("destinoId").value = "";
  modalFormEl.show();
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("destinoId").value;
  const payload = {
    nome: document.getElementById("nome").value.trim(),
    pais: document.getElementById("pais").value.trim(),
    melhor_epoca: document.getElementById("melhor_epoca").value.trim(),
    imagem_principal: document.getElementById("imagem_principal").value.trim(),
    descricao: document.getElementById("conteudo").value.trim(),
    atracoes: document.getElementById("atracoes").value.split("\n").map(x=>x.trim()).filter(Boolean)
  };
  try{
    if(id){
      await fetch(`${API}/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.assign({id:+id},payload)) });
    } else {
      await fetch(API, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    }
    modalFormEl.hide();
    await fetchLugares();
  }catch{
    alert("Erro ao salvar no servidor");
  }
});

window.abrirDetalhe = async function(id){
  try{
    const r = await fetch(`${API}/${id}`);
    if(!r.ok) throw new Error("fetch");
    const l = await r.json();
    document.getElementById("detalheTitle").textContent = `${l.nome} • ${l.pais}`;
    document.getElementById("detalheImg").src = l.imagem_principal || "";
    document.getElementById("detalheConteudo").textContent = l.descricao || "";
    document.getElementById("detalhePais").textContent = l.pais || "";
    document.getElementById("detalheEpoca").textContent = l.melhor_epoca || "Variável";
    const ul = document.getElementById("detalheAtracoes");
    ul.innerHTML = (l.atracoes || []).map(a => `<li class="list-group-item">${a}</li>`).join("") || "<li class='list-group-item'>Sem informações</li>";
    document.getElementById("detalheEditar").onclick = ()=>{ modalDetalheEl.hide(); abrirEditar(id); }
    document.getElementById("detalheExcluir").onclick = async ()=>{ if(confirm("Excluir este destino?")){ await fetch(`${API}/${id}`,{method:"DELETE"}); modalDetalheEl.hide(); fetchLugares(); } }
    modalDetalheEl.show();
  }catch{
    alert("Não foi possível carregar o destino");
  }
}

window.abrirEditar = async function(id){
  try{
    const r = await fetch(`${API}/${id}`);
    if(!r.ok) throw new Error("fetch");
    const l = await r.json();
    document.getElementById("modalTitle").textContent = "Editar destino";
    document.getElementById("destinoId").value = l.id || "";
    document.getElementById("nome").value = l.nome || "";
    document.getElementById("pais").value = l.pais || "";
    document.getElementById("melhor_epoca").value = l.melhor_epoca || "";
    document.getElementById("imagem_principal").value = l.imagem_principal || "";
    document.getElementById("conteudo").value = l.descricao || "";
    document.getElementById("atracoes").value = (l.atracoes||[]).join("\n");
    modalFormEl.show();
  }catch{
    alert("Não foi possível carregar os dados para edição");
  }
}

search.addEventListener("input", ()=> renderCards(lugaresCache) );

fetchLugares();

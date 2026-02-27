const background = document.getElementById("background");

const words = [
"Próximamente",
"Coming Soon",
"Bientôt",
"Demnächst",
"In Arrivo",
"Em Breve",
"近日公開",
"곧 출시"
];

function createRow() {
    const row = document.createElement("div");
    row.classList.add("row");

    let text = "";
    for(let i = 0; i < 20; i++){
        text += words.join("   •   ") + "   •   ";
    }

    row.textContent = text;
    background.appendChild(row);
}

for(let i = 0; i < 12; i++){
    createRow();
}
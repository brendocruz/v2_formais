let tableNFA = document.querySelector("#tableNFA");
let tableDFA = document.querySelector("#tableDFA");

function initTable(table, numberOfRows, numberOfColumns) {
	for(let index = 0; index < numberOfRows; index++)
		addRow(table, numberOfColumns);
}

function addColumn(table) {
	let rows = table.children;
	for(let index = 0; index < rows.length; index++) {
		let newColumn = document.createElement("div");
		newColumn.addEventListener("dblclick", editContent, false);
		rows[index].append(newColumn);
	}
}

function addRow(table, numberOfColumns=-1) {
	if(numberOfColumns === -1) {
		let currentElement = table.firstElementChild.firstElementChild;
		let currentIndex = 0;
		for(let nextElement = currentElement; nextElement != null; nextElement = nextElement.nextElementSibling)
			currentIndex++;
		numberOfColumns = currentIndex;
	}

	let newRow = document.createElement("div");
	newRow.className = "row";
	newRow.addEventListener("click", setCellStatus, false);
	let newColumn;
	for(let index = 0; index < numberOfColumns; index++) {
		newColumn = document.createElement("div");
		newColumn.addEventListener("mouseenter", editContent, false);
		newColumn.addEventListener("mouseleave", editContent, false);
		newRow.append(newColumn);
	}
	table.append(newRow);
}

function editContent() {
	this.toggleAttribute("autofocus");
	this.toggleAttribute("contentEditable");
}

function tableToNFA() {
	let firstRow = tableNFA.firstElementChild;
	let alphabetRow = firstRow.firstElementChild.nextElementSibling;
	let alphabet = [];
	let states = [];
	let isInicialState = [];
	let isAcceptState = [];
	let edges = [];
	for(let nextElement = alphabetRow; nextElement !== null; nextElement = nextElement.nextElementSibling)
		alphabet.push(nextElement.textContent);
	alphabet = alphabet.join("");

	let secondRow = firstRow.nextElementSibling;
	let currentRow;
	for(let nextElement = secondRow; nextElement !== null; nextElement = nextElement.nextElementSibling) {
		currentRow = nextElement.firstElementChild;
		states.push(currentRow.textContent);
		isInicialState.push(currentRow.hasAttribute("data-inicial"));
		isAcceptState.push(currentRow.hasAttribute("data-accept"));
		let rowContent = [];
		for(let nextColumn = nextElement.firstElementChild.nextElementSibling; nextColumn !== null; nextColumn = nextColumn.nextElementSibling)
			rowContent.push(nextColumn.textContent);
		edges.push(rowContent);
	}

	let inicialState;
	for(let index = 0; index < isInicialState.length; index++) {
		if(isInicialState[index]) {
			inicialState = states[index];
			break;
		}
	}

	let acceptStates = [];
	for(let index = 0; index < isAcceptState.length; index++) {
		if(isAcceptState[index])
			acceptStates.push(states[index]);
	}

	let nfa;
	if(alphabet.indexOf("&") !== -1)
		nfa = new Automaton("enfa", alphabet, states.join(","), inicialState, acceptStates.join(","));
	else nfa = new Automaton("nfa", alphabet, states.join(","), inicialState, acceptStates.join(","));
	for(let index = 0; index < states.length; index++) {
		for(let column = 0; column < edges[0].length; column++) {
			nfa.addJoin(states[index], alphabet[column], edges[index][column]);
		}
	}
	console.log(nfa);
	return nfa;
}

function DFAToTable(dfa) {
	let table = document.createDocumentFragment();
	let numberOfRows = dfa.states.length + 1;
	let numberOfColumns = dfa.alphabet.length + 1;
	initTable(table, numberOfRows, numberOfColumns);
	
	let headerRow = table.firstElementChild;
	let firstHeaderElement = headerRow.firstElementChild.nextElementSibling;
	let counter = 0;
	for(let nextElement = firstHeaderElement; nextElement !== null; nextElement = nextElement.nextElementSibling)
		nextElement.innerHTML = dfa.alphabet[counter++];

	let sideColumn = table.children;
	let sideElement;
	for(let index = 0; index < numberOfRows - 1; index++) {
		sideElement = sideColumn[index + 1].firstElementChild;
		sideElement.innerHTML = dfa.states[index].name;
		if(dfa.states[index].name === dfa.startState)
			sideElement.toggleAttribute("data-inicial");
		if(dfa.acceptStates.indexOf(dfa.states[index].name) !== -1)
			sideElement.toggleAttribute("data-accept");
	}


	let data;
	for(let index = 0; index < numberOfRows - 1; index++) {
		for(let column = 0; column < numberOfColumns - 1; column++) {
			data = dfa.states[index].joins[dfa.alphabet[column]];
			sideColumn[index + 1].children[column + 1].innerHTML = data;
		}
	}

	tableDFA.innerHTML = "";
	tableDFA.append(table);
}

function setCellStatus() {
	if(event.shiftKey)
		this.firstElementChild.toggleAttribute("data-inicial");
	else if(event.ctrlKey)
		this.firstElementChild.toggleAttribute("data-accept");
}

function convert(type) {
	let startState = tableNFA.querySelectorAll("[data-inicial");
	let acceptState = tableNFA.querySelectorAll("[data-accept]");
	if(startState.length === 0)
		alert("É necessário haver um estado inicial.");
	else if(startState.length > 1)
		alert("É necessário haver somente um estado inicial.");
	if(acceptState.length === 0)
		alert("É necessário haver ao menos um estado de aceitação.");
	if(startState.length === 0 || startState.length > 1 || acceptState.length === 0)
		return;

	let states = tableNFA.querySelectorAll(".row:first-child > div:not(:first-child)");
	let epsilonState = null;
	for(item of states) {
		if(item.textContent === "&")
			epsilonState = item;
	}

	if(type === "enfa" && !epsilonState) {
		alert("Um ENFA deve incluir um estado epsilon.");
		return;
	} else if(type === "nfa" && epsilonState) {
		alert("Estado inválido, um NFA não pode ter um estado epsilon.");
		return;
	}


	let nfa = tableToNFA(), dfa;
	if(type === "enfa")
		dfa = nfa.ENFAtoDFA();
	else if(type === "nfa")
		dfa = nfa.NFAtoDFA();		
	DFAToTable(dfa); 
}

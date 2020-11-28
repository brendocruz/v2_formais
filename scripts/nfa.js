class Node {
	constructor(symbol, startState, fatherNode) {
		this.symbol = symbol;
		this.fatherNode = fatherNode;
		this.startState = startState;
		this.child = []
	}

	toString() {
		return `[${this.symbol}]`;
	}
}

class NFA {
	constructor(alphabet, startState, stateSet, transitionFunction, finalStates) {
		this.alphabet = alphabet;
		this.startState = startState;
		this.currentState = startState;
		this.stateSet = stateSet;
		this.transitionFunction = transitionFunction;
		this.finalStates = finalStates;
	}
}

function execute(nfa, string) {
	let node = new Node(string[0], nfa.startState);
	executeAux(nfa, string, 0, node);
	return node;
}

function executeAux(nfa, string, position, node) {
	if(position >= string.length) return true;
	let symbol = string[position];
	let nextSymbol = string[position + 1];
	let endState = nfa.transitionFunction[node.startState][symbol];
	for(let state of endState) {
		let newNode = new Node(nextSymbol, state, node);
		node.child.push(newNode);
		executeAux(nfa, string, position + 1, newNode);
	}
}

function print(node, level, acceptStates) {
	let div = document.createElement("div");
	if(node.symbol !== undefined) div.classList.add("plus");

	let isAcceptState = false;
	for(let item of acceptStates) {
		if(node.startState === item) {
			isAcceptState = true;
			break;
		}
	}

	let span = document.createElement("span");
	if(isAcceptState && node.symbol === undefined) {
		span.innerHTML = `Símbolo: ${"FIM: Válido"} | Estado: ${node.startState}`;
	} else {
		span.innerHTML = `Símbolo: ${(node.symbol === undefined ? "FIM: Não válido" : node.symbol)} | Estado: ${node.startState}`;
	}
	div.append(span);

	for(child of node.child)
		div.append(print(child, level + 1, acceptStates));
	return div;
}

let tree = document.querySelector("div.tree");
let inputString = document.querySelector("#string");

function convertNFA() {
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

	let nfa = tableToAutonaton();
	let node = execute(nfa, inputString.value);
	console.log(node);
	console.log(nfa);
	tree.innerHTML = "";
	tree.append(print(node, 0, nfa.finalStates))
}

function tableToAutonaton() {
	let firstRow = tableNFA.firstElementChild;
	let alphabetRow = firstRow.firstElementChild.nextElementSibling;
	let alphabet = [], states = [], inicialState = [];
	let acceptStates = [], edges = [];

	for(let nextElement = alphabetRow; nextElement !== null; nextElement = nextElement.nextElementSibling)
		alphabet.push(nextElement.textContent)
	alphabet = alphabet.join("");

	let currentRow, rowContent;
	for(let nextElement = firstRow.nextElementSibling; nextElement !== null; nextElement = nextElement.nextElementSibling) {
		currentRow = nextElement.firstElementChild;
		states.push(currentRow.textContent);
		if(currentRow.hasAttribute("data-inicial"))
			inicialState.push(currentRow.textContent);
		if(currentRow.hasAttribute("data-accept"))
			acceptStates.push(currentRow.textContent)
		rowContent = [];
		for(let nextColumn = nextElement.firstElementChild.nextElementSibling; nextColumn !== null; nextColumn = nextColumn.nextElementSibling)
			rowContent.push(nextColumn.textContent);
		edges.push(rowContent)
	}

	let transitionFunction = {};
	for(let index = 0; index < states.length; index++) {
		transitionFunction[states[index]] = {};
		for(let column = 0; column < edges[index].length; column++)
			transitionFunction[states[index]][alphabet[column]] = edges[index][column];
	}

	let nfa = new NFA(alphabet, inicialState, states, transitionFunction, acceptStates);
	return nfa;
}

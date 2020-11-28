class Automaton {
	constructor(type, alphabet, states="", startState="", acceptStates="") {
		this.states = [];
		this.acceptStates = acceptStates;
		this.startState = startState;
		this.type = type;

		if(type === "enfa" && alphabet.indexOf("&") === -1)
			this.alphabet = alphabet.concat("&");
		else this.alphabet = alphabet;

		let stateOfSet = states.split(",");
		for(let item of stateOfSet)
			if(item !== "")
				this.addState(item);
	}

	addState(stateName) {
		let newStateName = stateName;
		if(Array.isArray(stateName))
			newStateName = stateName.join(" ");
		if(this.getStateObject(newStateName)) return;
		let newState = {name: newStateName, joins: {}};
		for(let symbol of this.alphabet)
			newState.joins[symbol] = "";
		this.states.push(newState);
	}

	addJoin(stateName, symbol, endStateName) {
		let stateObject = this.getStateObject(stateName);
		let endStates = endStateName;
		if(typeof endStateName === 'string')
			endStates = endStateName.split(",");
		if(stateObject.joins[symbol] !== "")
			endStates.push(... stateObject.joins[symbol].split(","));
		let finalJoin = [];
		let len = endStates.length;
		for(let index = 0; index < len; index++) {
			let item = endStates.pop();
			if(endStates.indexOf(item) === -1)
				finalJoin.push(item);
		}
		finalJoin = finalJoin.reverse().join(",");
		stateObject.joins[symbol] = finalJoin;
	}

	getStateObject(stateName) {
		if(stateName === undefined) return;

		let stateNameParts = stateName;
		if(typeof stateName === 'string')
			stateNameParts = stateName.split(" ");

		for(let otherState of this.states) {
			let otherStateParts = otherState.name.split(" ");
			if(otherStateParts.length === stateNameParts.length) {
				let amount = 0;
				for(let index = 0; index < otherStateParts.length; index++) {
					if(otherStateParts.indexOf(stateNameParts[index]) !== -1)
						amount++;
				}

				if(amount === otherStateParts.length)
					return otherState;
			}
		}
		return null;
	}

	eclose(stateName) {
		let stateObject = this.getStateObject(stateName);
		let ecloseStates = stateObject.name;
		let endStates = stateObject.joins["&"];
		if(endStates !== "")
			ecloseStates = ecloseStates.concat(",", endStates);
		return ecloseStates;
	}
	
	ENFAtoDFA() {
		let epsilon = this.alphabet.indexOf("&");
		let newAlphabet = this.alphabet.split("");
		newAlphabet.splice(epsilon, 1);
		newAlphabet = newAlphabet.join("");
		let dfa = new Automaton("dfa", newAlphabet);
		let NFAStartStateEClose = this.eclose(this.startState);
		dfa.addState(NFAStartStateEClose);
		dfa.startState = NFAStartStateEClose;

		let currentDFAStateIndex = 0;
		while(currentDFAStateIndex < dfa.states.length) {
			let DFACurrentState = dfa.states[currentDFAStateIndex];

			for(let symbol of dfa.alphabet) {
				let DFACurrentStateParts = DFACurrentState.name.split(",");
				for(let partOfCurrent of DFACurrentStateParts) {
					let NFAEndStateObject = this.getStateObject(partOfCurrent);
					let NFAEndStateJoins = NFAEndStateObject.joins[symbol];
					let NFAEndStateParts = NFAEndStateJoins.split(",");
					let stateParts = []
					for(let part of NFAEndStateParts) {
						if(part === "") continue;
						let stateObject = this.getStateObject(part);
						if(stateObject)
							stateParts.push(stateObject.name);
						stateParts.push(this.eclose(part));
					}

					if(stateParts.length === 0) continue;
					let finalState = stateParts.join(",");
					dfa.addJoin(DFACurrentState.name, symbol, finalState);
				}
			}

			for(let symbol in DFACurrentState.joins) {
				if(DFACurrentState.joins[symbol] === "") continue;
				dfa.addState(DFACurrentState.joins[symbol]);
			}
			
			currentDFAStateIndex++;
		}

		let NFAAcceptState = this.acceptStates.split(",");
		let DFAAcceptState = []
		for(let index = 0; index < dfa.states.length; index++) {
			for(let part of dfa.states[index].name.split(",")) {
				for(let column = 0; column < NFAAcceptState.length; column++) {
					if(part === NFAAcceptState[column])
						DFAAcceptState.push(dfa.states[index].name);
				}
			}
		}
		dfa.acceptStates = DFAAcceptState;
		return dfa;
	}

	NFAtoDFA() {
		let dfa = new Automaton("dfa", this.alphabet);
		dfa.addState(this.startState);
		dfa.startState = this.startState;

		let currentDFAStateIndex = 0;
		while(currentDFAStateIndex < dfa.states.length) {
			let DFACurrentState = dfa.states[currentDFAStateIndex];

			for(let symbol of dfa.alphabet) {
				let DFACurrentStateParts = DFACurrentState.name.split(",");
				for(let partOfCurrent of DFACurrentStateParts) {
					let NFAEndStateObject = this.getStateObject(partOfCurrent);
					let NFAEndStateJoins = NFAEndStateObject.joins[symbol];
					let NFAEndStateParts = NFAEndStateJoins.split(",");
					let stateParts = []
					for(let part of NFAEndStateParts) {
						if(part === "") continue;
						let stateObject = this.getStateObject(part);
						if(stateObject)
							stateParts.push(stateObject.name);
						//stateParts.push(this.eclose(part));
					}

					if(stateParts.length === 0) continue;
					let finalState = stateParts.join(",");
					dfa.addJoin(DFACurrentState.name, symbol, finalState);
				}
			}

			for(let symbol in DFACurrentState.joins) {
				if(DFACurrentState.joins[symbol] === "") continue;
				dfa.addState(DFACurrentState.joins[symbol]);
			}
			
			currentDFAStateIndex++;
		}

		let NFAAcceptState = this.acceptStates.split(",");
		let DFAAcceptState = []
		for(let index = 0; index < dfa.states.length; index++) {
			for(let part of dfa.states[index].name.split(",")) {
				for(let column = 0; column < NFAAcceptState.length; column++) {
					if(part === NFAAcceptState[column])
						DFAAcceptState.push(dfa.states[index].name);
				}
			}
		}
		dfa.acceptStates = DFAAcceptState;
		return dfa;
	}
}
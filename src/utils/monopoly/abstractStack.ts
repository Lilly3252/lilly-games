export class AbstractStack {
	cardfulToggler: Generator<unknown, never, unknown>;
	cardlessToggler: Generator<unknown, never, unknown>;
	constructor(stack) {
		const cardfulStack = { ...stack };
		let cardfulArray = shuffle(Object.keys(cardfulStack));
		const cardlessArray = cardfulArray.filter((card) => card !== "getOutOfJail").map((card) => stack[card]);
		cardfulArray = Object.freeze(cardfulArray.map((card) => stack[card]));
		const toggler = (function () {
			let i = 0;
			return function (flag) {
				const chosenArray = flag === "with" ? cardfulArray : cardlessArray;
				return function* () {
					while (true) {
						i++;
						if (i >= chosenArray.length) {
							i = 0;
						}
						yield chosenArray[i];
					}
				};
			};
		})();
		this.cardfulToggler = toggler("with")();
		this.cardlessToggler = toggler("without")();
	}

	selectToggler(property) {
		if (property) {
			return this.cardfulToggler;
		}
		return this.cardlessToggler;
	}
}

function shuffle(array: Array<string>) {
	for (let i = 0; i < array.length; i++) {
		const n = Math.floor(Math.random() * array.length);
		const el = array[n];
		array.splice(n, 1);
		array.push(el);
	}
	return array;
}

import DropDownControl from './DropDown.js';

export default class SpinnerControl extends DropDownControl {
	constructor(emitter, key, max, title) {
		let options = Array(max).fill().map(function(x,i){return ({value: i, label: i})});
		super(emitter, key, options, title);
	}
}

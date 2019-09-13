import Rete from "rete";
import $ from 'jquery';

export default class DropDownControl extends Rete.Control {
	
	constructor(emitter, key, idName, listData) {
		super(key);
		this.emitter = emitter;
		this.key = key; //storage key
		this.idName = idName; //ID in dom
		this.listData = listData;
		this.template = `
			<select @input="change($event)" al-value="selectedId" al-select="selected">
				<option value="">No selected</option>
				<option value={{item.value}} al-repeat="item in listData" >{{item.name}}</option>
			</select>`
		
		this.scope = {
			value: null,
			listData,
			change: this.change.bind(this)
		};
	}
	
	change(e) {
		this.scope.value = e.target.value;
		this.putData(this.key, e.target.value);
		this.update();
	}
	
	update() {
		this.putData(this.key, this.scope.value);
		this.emitter.trigger('process');
		this._alight.scan();
		console.log
	}
	
	mounted() {
		this.scope.value = this.getData(this.key);
		this.update();
	}
}
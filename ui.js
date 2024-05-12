

class Button {
	constructor (id, callback, isEnabled = true) {
		this.id = id;
		this.callback = callback;
		this.enabled = isEnabled;

		this.disabledClass = "disabled";

		this.elem = document.getElementById (id);
		this.elem.addEventListener ('click', () => { this.call(); });
	}

	call () {
		if (this.enabled) this.callback();
	}
	
	enable () {
		this.enabled = true;
		this.elem.classList.remove (this.disabledClass);
	}

	disable () {
		this.disable = true;
		this.elem.classList.add (this.disabledClass);
	}
}


class Switch {
	constructor (id, switchCallback = null) {
		this.id = id;
		this.elem = document.getElementById (id);
		this.elem.addEventListener ('click', () => { this.toggle(); });
		this.enabled = false;

		this.enabledClass = "enabled";
		this.disabledClass = "disabled";

		this.onSwitch = switchCallback;

		if (this.elem.classList.contains (this.enabledClass)) {
			this.enable();
		} else {
			this.disable();
		}
	}

	toggle (ev) {
		if (this.enabled) this.disable();
		else this.enable();
	}

	enable () {
		this.elem.classList.add (this.enabledClass);
		this.elem.classList.remove (this.disabledClass);
		this.enabled = true;
		if (this.onSwitch != null) this.onSwitch (true);
	}

	disable () {
		this.elem.classList.add (this.disabledClass);
		this.elem.classList.remove (this.enabledClass);
		this.enabled = false;
		if (this.onSwitch != null) this.onSwitch (false);
	}

	isEnabled () {
		return this.enabled;
	}

	setSwitchCallback (callback) {
		this.onSwitch = callback;
	}
}


class IntInput {
	constructor (id) {
		this.id = id;
		this.elem = document.getElementById (id);
		this.invalidClass = "bad";

		this.elem.addEventListener ('input', () => { this.validateInput(); });
	}

	validateInput () {
		if (this.isValid()) {
			this.elem.classList.remove (this.invalidClass);
		} else {
			this.elem.classList.add (this.invalidClass);
		}
	}

	isValid () {
		return /^\d+$/.test (this.elem.value);
	}

	get () {
		return parseInt (this.elem.value);
	}
}


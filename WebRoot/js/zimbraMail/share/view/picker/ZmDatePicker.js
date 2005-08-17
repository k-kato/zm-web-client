function ZmDatePicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.DATE);
}

ZmDatePicker.prototype = new ZmPicker;
ZmDatePicker.prototype.constructor = ZmDatePicker;

ZmPicker.CTOR[ZmPicker.DATE] = ZmDatePicker;

ZmDatePicker.prototype.toString = 
function() {
	return "ZmDatePicker";
}

ZmDatePicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);
	var selectId = Dwt.getNextId();
	var calId = Dwt.getNextId();
    
    var html = new Array(20);
    var i = 0;
    html[i++] = "<table cellpadding='3' cellspacing='0' border='0' style='width:100%;'>";
    html[i++] = "<tr align='center' valign='middle'>";
    html[i++] = "<td align='right' nowrap>" + ZmMsg.date + ":</td>";
    html[i++] = "<td align='left' nowrap>";
    html[i++] = "<select name='op' id='" + selectId + "'>";
    html[i++] = "<option value='after'>" + ZmMsg.isAfter + "</option>";
    html[i++] = "<option selected value='before'>" + ZmMsg.isBefore + "</option>";
    html[i++] = "<option value='date'>" + ZmMsg.isOn + "</option>";
    html[i++] = "</select>";
    html[i++] = "</td>";
    html[i++] = "</tr>";
    html[i++] = "<tr valign='left'>";
    html[i++] = "<td nowrap align='center' colspan='2' id='" + calId + "'></td>";
    html[i++] = "</tr>";
    html[i++] = "</table>";
	picker.getHtmlElement().innerHTML = html.join("");

	var cal = this._cal = new DwtCalendar(picker);
	cal.setDate(new Date());
	cal.addSelectionListener(new AjxListener(this, this._calSelectionListener));
	
	var doc = this.getDocument();
	Dwt.getDomObj(doc, calId).appendChild(cal.getHtmlElement());
	var select = this._select = Dwt.getDomObj(doc, selectId);
	select.onchange = ZmDatePicker._onChange;
	select._picker = this;
	this._updateQuery();
}

// Set date for second instance of date picker to 3 months back, select "after"
ZmDatePicker.prototype.secondDate =
function() {
	this._select.selectedIndex = 0;
	var date = new Date(this._cal.getDate());
	AjxDateUtil.roll(date, AjxDateUtil.MONTH, -3);
	this._cal.setDate(date);
	this._updateQuery();
}

ZmDatePicker.prototype._updateQuery = 
function() {
	var d = this._cal.getDate();
	if (d) {
		var date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
		this.setQuery(this._select.value + ":" + date);
	} else {
		this.setQuery("");
	}
	this.execute();
}

ZmDatePicker._onChange = 
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	picker._updateQuery();
}

ZmDatePicker.prototype._calSelectionListener =
function(ev) {
	this._updateQuery();
}

function ZmEditInstanceSeriesView (parent, recurranceInstance) {
	DwtComposite.call(this,parent,"ZmEditInstanceSeriesView");
	this._formId = Dwt.getNextId();
	this._form = new XForm(this.getForm(this._formId), null, recurranceInstance, this);
	this._form.setController(this);
	this._recInstance = recurranceInstance;
	this.render();
}

ZmEditInstanceSeriesView.prototype = new DwtComposite();
ZmEditInstanceSeriesView.prototype.constructor = ZmEditInstanceSeriesView;

ZmEditInstanceSeriesView.prototype.render = function () {
	this._form.draw();
};

ZmEditInstanceSeriesView.prototype.getDragHandleId = function () {
	if (this._dragHandleId == null) {
		this._dragHandleId =  this._formId + "_dialogTitle";
	}
	return this._dragHandleId;
};

ZmEditInstanceSeriesView.prototype.getForm = function (formId) {
	if (this._xform != null) return this._xform;
	this._xform = {
		numCols:1,
		id: formId,
		items: [
				//{ref:"title", cssClass: "title", id:"dialogTitle", type: _OUTPUT_},
				//{type:_SPACER_, height:10},
		    {ref: "message", type: _OUTPUT_},
 		    {type:_SPACER_, height:15},
		    {type:_GROUP_, numCols:5, cssStyle:"width:100%",  relevant:"instance.operation != ZmAppt.MODE_DELETE",
			 items: [
				{type:_DWT_BUTTON_, label:ZmMsg.openInstance, onActivate:"this.getFormController().buttonHit(event)"},
				{type:_CELL_SPACER_, width:2},
			    {type:_DWT_BUTTON_, label:ZmMsg.openSeries, onActivate:"this.getFormController().buttonHit(event)"}, 
				{type:_CELL_SPACER_, width:2},
		        {type:_DWT_BUTTON_, label:ZmMsg.cancel, onActivate:"this.getFormController().buttonHit(event)"}
				]
			},
		    {type:_GROUP_, numCols:3, cssStyle:"width:100%", relevant:"instance.operation == ZmAppt.MODE_DELETE",
			 items: [
		{type:_DWT_BUTTON_, width:"95px", label:ZmMsg.deleteInstance, onActivate:"this.getFormController().buttonHit(event)"},
			     {type:_DWT_BUTTON_, label:ZmMsg.deleteSeries, onActivate:"this.getFormController().buttonHit(event)"}, 
		         {type:_DWT_BUTTON_, label:ZmMsg.cancel, onActivate:"this.getFormController().buttonHit(event)"}
				]
			}

		]
	}
	return this._xform;
};

// this is the item
ZmEditInstanceSeriesView.prototype.buttonHit = function (event, form, item) {
	this.notifyListeners(DwtEvent.BUTTON_PRESSED, event);
};

ZmEditInstanceSeriesView.prototype.setData = function (obj) {
	this._recInstance = obj;
	this._form.setInstance(obj);
};

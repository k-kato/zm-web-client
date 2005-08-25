/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCalDayView(parent, posStyle, dropTgt, view, numDays) {
	if (arguments.length == 0) return;
	if (numDays == null) numDays = 1;
	var className = "calendar_view";
	if (view == null) view = ZmController.CAL_DAY_VIEW;
	this._numDays = numDays;
	ZmCalBaseView.call(this, parent, className, posStyle, view, dropTgt);
	//this.getHtmlElement().style.overflow = "hidden";	
	//this.setScrollStyle(DwtControl.SCROLL);
	this.setScrollStyle(DwtControl.CLIP);	
	this._needFirstLayout = true;
	this._normalClassName = "calendar_grid_body_cell";
	this._selectedClassName = this._normalClassName+"-selected";
}

ZmCalDayView.prototype = new ZmCalBaseView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView._minApptWidth = 20;
ZmCalDayView._dayHeadingHeight = 23;
ZmCalDayView._dayFbWidth = 5;
ZmCalDayView._scrollBarWidth = 20;

ZmCalDayView._apptXFudge = 0; // due to border stuff
ZmCalDayView._apptYFudge = -1; // ditto
ZmCalDayView._apptWidthFudge = (AjxEnv.isIE ? 0 : -3); // due to border stuff
ZmCalDayView._apptHeightFudge = (AjxEnv.isIE ? 0 : -4); // ditto

ZmCalDayView.prototype.toString = 
function() {
	return "ZmCalDayView";
}

ZmCalDayView.prototype.getRollField =
function(isDouble) {
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
		case ZmController.CAL_WEEK_VIEW:
			return isDouble ? AjxDateUtil.MONTH : AjxDateUtil.WEEK;
			break;
		case ZmController.CAL_DAY_VIEW:
		default:
			return isDouble ? AjxDateUtil.WEEK : AjxDateUtil.DAY;
			break;		
	}
}

ZmCalDayView.prototype._updateRange =
function(rangeChanged) {
	this._updateDays();
	this._timeRangeStart = this._days[0].date.getTime();
	this._timeRangeEnd = this._days[this._numDays-1].date.getTime() + AjxDateUtil.MSEC_PER_DAY;
}

ZmCalDayView.prototype._dateUpdate =
function(rangeChanged) {
	this._clearSelectedTime();
	this._updateSelectedTime();
}

ZmCalDayView.prototype._preSet = 
function() {
	this._resetAllDayData();
}

ZmCalDayView.prototype._postSet = 
function() {
//DBG.println("_postSet");
	// nuke any previous all day rows
	var table = Dwt.getDomObj(this.getDocument(), this._headerTableId);
	while (table.rows.length > 1)
		table.deleteRow(1);
	
	this._computeApptLayout();
	this._computeAllDayApptLayout();
	if (!this._needFirstLayout)
		this._layoutAppts();
	this._layout();
	var act = new AjxTimedAction();
	act.method = ZmCalDayView._scrollTo8AM;
	act.params.add(this);
	AjxTimedAction.scheduleAction(act,1);
	//this._scrollTo8AM();
}

ZmCalDayView._scrollTo8AM =
function(args)
{
	var view = args[0];
	var e = 	Dwt.getDomObj(view.getDocument(), view._days[0].hoursId[8]);
	if (e) {
		var loc = Dwt.getLocation(e);
		var bodyElement = Dwt.getDomObj(view.getDocument(), view._bodyDivId);
		bodyElement.scrollTop = loc.x;
	}
}

ZmCalDayView.prototype._updateTitle =
function() 
{
	if (this._numDays == 1) {
		var date = this._date;	
		this._title = DwtMsg.LONG_MONTH[date.getMonth()] + " " + date.getDate(); // + ", " + date.getFullYear();
	} else {
		var first = this._days[0].date;
		var last = this._days[this._numDays-1].date;
		this._title = DwtMsg.LONG_MONTH[first.getMonth()]+" "+first.getDate()+" - " +
				 DwtMsg.LONG_MONTH[last.getMonth()]+" "+last.getDate(); //+", "+last.getFullYear();
	}				 
}

ZmCalDayView.prototype._dayTitle =
function(date) {
	var title = (this._numDays == 1) ?
		DwtMsg.LONG_WEEKDAY[date.getDay()]+", "+DwtMsg.LONG_MONTH[date.getMonth()]+" "+date.getDate() :
		DwtMsg.MEDIUM_WEEKDAY[date.getDay()]+", "+DwtMsg.MEDIUM_MONTH[date.getMonth()]+" "+date.getDate();
	return AjxStringUtil.htmlEncode(title);
}

ZmCalDayView.prototype._updateDays =
function() {
	var d = new Date(this._date.getTime());
	d.setHours(0,0,0,0);	
	var dow;

	var now = new Date();
	now.setHours(0, 0, 0, 0);
			
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
			dow = d.getDay();
			if (dow == 0)
				d.setDate(d.getDate()+1);
			else if (dow != 1)
				d.setDate(d.getDate()-(dow-1));
			break;				
		case ZmController.CAL_WEEK_VIEW:
			dow = d.getDay();
			if (dow != 0)
				d.setDate(d.getDate()-dow);
			break;
		case ZmController.CAL_DAY_VIEW:
		default:
			/* nothing */
			break;		
	}

	var doc = this.getDocument();
	
	this._dateToDayIndex = new Object();
	
	var lastDay = this._numDays - 1;
	for (var i=0; i < this._numDays; i++) {
		var day = this._days[i];
		day.lastDay = (i == lastDay);
		day.date = new Date(d);
		day.endDate = new Date(d);
		day.endDate.setHours(23,59,59,999);
		this._dateToDayIndex[this._dayKey(day.date)] = day;

 		var te = Dwt.getDomObj(doc, day.titleId);
		te.innerHTML = this._dayTitle(d);

 		//var ttd = Dwt.getDomObj(doc, day.titleTdId);
		//ttd.className = d.getTime() == now.getTime() ? "calendar_header_cells_td_today" : "calendar_header_cells_td";
		
		var btd = Dwt.getDomObj(doc, day.bodyTdId);
		btd.className = d.getTime() == now.getTime() ? "calendar_cells_td_today" : "calendar_cells_td";
		
		d.setDate(d.getDate()+1);
		
		
	}
	
	var te = Dwt.getDomObj(doc, this._headerYearId);
	te.innerHTML = this._days[0].date.getFullYear();
	
}

ZmCalDayView.prototype._resetAllDayData =
function() {
	this._allDayAppts = {};
	this._allDayApptsList = [];
	this._allDayApptsRowLayouts = [];
	// this controls number of initial all day appt rows added
	this._addAllDayApptRowLayout();
}

/**
 * we don't want allday appts that span days to be fanned out
 */
ZmCalDayView.prototype._fanoutAllDay =
function(appt) {
	return false;
}

/*
 * keep track of the all day appts
 *
 */
ZmCalDayView.prototype._addAllDayAppt = 
function(ao, now) {
	var id = ao.getUniqueId();
	var isStartInView = this.isStartInView(ao);
	var isEndInView = this.isEndInView(ao);
	var startTime = Math.max(ao.getStartTime(), this._timeRangeStart);
	var endTime = Math.min(ao.getEndTime(), this._timeRangeEnd);
	var numDays = Math.floor((endTime-startTime)/AjxDateUtil.MSEC_PER_DAY);
	this._allDayAppts[id] = {
		appt: ao,
		startTime: startTime,
		isStartInView: isStartInView,
		isEndInView: isEndInView,
		numDays: numDays
	};

	// call _createAllDayItemHtml after setting the _allDayAppts data, since _createAllDayItemHtml needs it
	this._allDayAppts[id].div =  this._createAllDayItemHtml(ao, now, false);
	
	this._allDayApptsList.push(ao);	
}

ZmCalDayView.prototype.addAppt = 
function(ao, now) {
	if (ao.isAllDayEvent()) {
		this._addAllDayAppt(ao, now);
	} else {
		var item = this._createItemHtml(ao, now);
		var div = this._getDivForAppt(ao);
		if (div) div.appendChild(item);
	}
}

ZmCalDayView.prototype._getDivForAppt =
function(appt) {
	var day =  this._getDayForDate(appt.getStartDate());
	if (day)
		return Dwt.getDomObj(this.getDocument(), day.bodyDivId);
	else
		return null;
}

// move this to Dwt?
ZmCalDayView.prototype._setOpacity =
function(el, opacity) {
	if (AjxEnv.isIE) el.style.filter = "alpha(opacity="+opacity+")";
	else el.style.opacity = opacity/100;
}

ZmCalDayView.prototype._createItemHtml =
function(appt, now, isDndIcon) {
	//DBG.println("---- createItem ---- "+appt);
	if (appt.isAllDayEvent()) {
		return this._createAllDayItemHtml(appt, now, isDndIcon);
	}
	
	// set up DIV
	var div = this.getDocument().createElement("div");

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div._styleClass = "appt";	
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	var pstatus = appt.getParticipationStatus();
	if (pstatus == ZmAppt.PSTATUS_DECLINED) {
		this._setOpacity(div, 20);
		//if (AjxEnv.isIE) div.style.filter = "alpha(opacity=20)";
		//else div.style.opacity = ".2";
	} else if (pstatus == ZmAppt.PSTATUS_TENTATIVE) {
		this._setOpacity(div, 60);	
		//if (AjxEnv.isIE) div.style.filter = "alpha(opacity=60)";	
		//else div.style.opacity = ".6";
	}

	this.associateItemWithElement(appt, div, DwtListView.TYPE_LIST_ITEM);

	var html = new Array(30);
	var idx = 0;

	var titleOnly = (appt.getDuration() <= 30*60*1000);

	var isNew = pstatus == ZmAppt.PSTATUS_NEEDS_ACTION;
	var isAccepted = pstatus == ZmAppt.PSTATUS_ACCEPT;
	var subs = {
		id: this._getItemId(appt),
		newState: isNew ? "_new" : "",
		color: "_blue",
		name: AjxStringUtil.htmlEncode(appt.getName()),
		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		statusKey: appt.getParticipationStatus(),
		status: isAccepted ? "" : appt.getParticipationStatusString()
	};

	div.innerHTML = DwtBorder.getBorderHtml(titleOnly ? "calendar_appt_30" : "calendar_appt", subs, null);

	return div;
}

ZmCalDayView.prototype._createAllDayItemHtml =
function(appt, now, isDndIcon) {

	var data = this._allDayAppts[appt.getUniqueId()];

	var isStartInView = data ? data.isStartInView : true;
	var isEndInView = data ? data.isEndInView : true;	

	var div = this.getDocument().createElement("div");

	div._styleClass = "allday";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	this.associateItemWithElement(appt, div, DwtListView.TYPE_LIST_ITEM);
	
	var html = new Array(10);
	var idx = 0;

	html[idx++] = "<table class=allday>";
	html[idx++] = "<tr>";
	if (isStartInView)
		html[idx++] = "<td><div class=allday_blue_start></div></td>";
	html[idx++] = "<td width=100%>";
	html[idx++] = "<div class=allday_blue_stretch><div class=allday_text>";
	html[idx++] = AjxStringUtil.htmlEncode(appt.getName());
	html[idx++] = "</div></div>";
	html[idx++] = "</td>";
	if (isEndInView)
		html[idx++] = "<td><div class=allday_blue_end></div></td>";
	html[idx++] = "</tr>";
	html[idx++] = "</table>";
	div.innerHTML = html.join("");
	return div;
}

ZmCalDayView.prototype._getDayForDate =
function(d) 
{
	return this._dateToDayIndex[this._dayKey(d)];
}	

ZmCalDayView.prototype._clearSelectedTime =
function() 
{
	if (this._selectedId != null) {
		var e = Dwt.getDomObj(this.getDocument(), this._selectedId);
		e.className = this._normalClassName;
		this._selectedId = null;
	}
}
	
ZmCalDayView.prototype._updateSelectedTime =
function() 
{
	var d = this._date;
	var t = d.getTime();
	if (t < this._timeRangeStart || t >= this._timeRangeEnd)
		return;

	var day =  this._getDayForDate(d);
	var h = d.getHours();
	var m = d.getMinutes();
	var isTop = m < 30;

	var id = day.hoursId[isTop ? h : h+"h"];
	
	var e = Dwt.getDomObj(this.getDocument(), id);
	e.className = this._selectedClassName;
	this._selectedId = id;

}

ZmCalDayView.prototype._createHeadersColGroupHtml =
function(html,idx) {
	html[idx++] = "<colgroup>";
	html[idx++] = "<col id='"+this._headerHourColId+"'>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<col id='"+this._days[i].headerColId+"'>";
	}
	html[idx++] =	"<col id='"+this._headerGutterColId+"'>"; // gutter
	html[idx++] = "</colgroup>";
	return idx;
}

ZmCalDayView.prototype._createHeadersHtml =
function(html,idx) {
	html[idx++] = "<td class=calendar_header_time_td><div id='"+this._headerYearId+"' class=calendar_header_time_text></div></td>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<td class=calendar_header_cells_td id='"+this._days[i].titleTdId+"'><div id='"+this._days[i].titleId+"' class=calendar_header_cells_text></div></td>";
	}
	html[idx++] = "<td class=calendar_header_cells_td style='border-left:none'><div class=calendar_header_cells_text>&nbsp;</div></td>";
	return idx;	
}

ZmCalDayView.prototype._createAllDayHtml =
function(html,idx) {
	html[idx++] = "<td>&nbsp;</td>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<td class=calendar_header_allday_td>&nbsp;</td>";
	}
	html[idx++] = "<td>&nbsp;</td>";	// gutter
	return idx;
}

// for each hour/halfhour
ZmCalDayView._idToData = {};

ZmCalDayView.prototype._createDaysHtml =
function(html,idx) {
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<td class='calendar_cells_td' id='"+this._days[i].bodyTdId+"'><div id='"+this._days[i].bodyDivId+"' style='position:relative'>";
		html[idx++] = "<table class=calendar_grid_day_table>";
		var hours = this._days[i].hoursId;
		for (var h=0; h < 24; h++) {
			var id = Dwt.getNextId();
			hours[h] = id;
			html[idx++] = "<tr><td class=calendar_grid_body_hour_td><div id='"+id+"' onclick='ZmCalDayView._onclickHandler(event)' ondblclick='ZmCalDayView._ondblclickHandler(event)' oncontextmenu='ZmCalDayView._oncontextmenuHandler(event)' class=calendar_grid_body_cell>&nbsp;</div></td></tr>";
			ZmCalDayView._idToData[id] = { top: true, hour: h, view: this, day: i};
			hours[h+"h"] = id = Dwt.getNextId();
			html[idx++] = "<tr><td class=calendar_grid_body_half_hour_td><div id='"+id+"' onclick='ZmCalDayView._onclickHandler(event)' ondblclick='ZmCalDayView._ondblclickHandler(event)' oncontextmenu='ZmCalDayView._oncontextmenuHandler(event)' class=calendar_grid_body_cell>&nbsp;</div></td></tr>";		
			ZmCalDayView._idToData[id] = { top: false, hour: h, view: this, day: i};
		}
		html[idx++] = "</table>";
		html[idx++] = "</div></td>";	
	}
	return idx;
}

ZmCalDayView.prototype._createBodyColGroupHtml =
function(html, idx) {
	html[idx++] = "<colgroup>";
	html[idx++] ="<col id='"+this._bodyHourColId+"'>";	
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<col id='"+this._days[i].bodyColId+"'>";
	}
	html[idx++] = "</colgroup>";
	return idx;
}

ZmCalDayView.prototype._createHoursHtml =
function(html,idx) {
	html[idx++] = "<td class=calendar_time_td><div id='"+this._bodyHourDivId+"'>";
	html[idx++] = "<table class=calendar_grid_day_table>";
	for (var h=0; h < 24; h++) {
		var hour = (h==0 || h == 12) ? 12 : h % 12;
		var ampm = (h < 12) ? "am" : "pm";
		html[idx++] = "<tr><td class=calendar_grid_body_time_td><div class=calendar_grid_body_time_text>";
		if (h == 0) {
			html[idx++] = "&nbsp;";
		} else if (h == 12) {
			html[idx++] = "Noon";		//XXX i18n		
		} else {
			html[idx++] = hour;
			html[idx++] = " ";
			html[idx++] = ampm;		
		}
		html[idx++] = "</div></td></tr>";	
	}
	//html[idx++] = "<tr><td class=calendar_grid_body_time_td><div class=calendar_grid_body_time_text>&nbsp;</div></td></tr>";		
	html[idx++] = "</table>";
	html[idx++] = "</div></td>";	
	return idx;
}

ZmCalDayView.prototype._createHtml =
function(abook) {
	this._days = new Object();
	this._hours = new Object();

	this._layouts = new Array();
	this._allDayAppts = new Array();

	var idx = 0;
	var html = new Array(500);

	this._headerYearId = Dwt.getNextId();  // id for year
	this._headerDivId = Dwt.getNextId();  // layout get height, set width
	this._headerTableId = Dwt.getNextId(); // layout width
	this._headerHourColId = Dwt.getNextId();
	this._headerGutterColId = Dwt.getNextId();

	this._allDayRows = new Array();

	this._bodyHourColId = Dwt.getNextId();
	this._bodyHourDivId = Dwt.getNextId();
	this._bodyDivId = Dwt.getNextId(); //layout width/height
	this._bodyTableId = Dwt.getNextId(); //layout width
	
	for (var i =0; i < this._numDays; i++) {
		this._days[i] = {
			index: i,
			titleTdId: Dwt.getNextId(),
			titleId: Dwt.getNextId(),
			headerColId: Dwt.getNextId(),
			bodyColId: Dwt.getNextId(),
			bodyDivId: Dwt.getNextId(),
			bodyTdId: Dwt.getNextId(),			
			hoursId: []
		};
	}

	html[idx++] = "<table class=calendar_view_table>";
	html[idx++] =   "<tr>";
	html[idx++] =     "<td>";
	html[idx++] =       "<div id='"+this._headerDivId+"' style='position:relative'>";
	html[idx++] =         "<table id='"+this._headerTableId+"' class=calendar_grid_table>";
	idx = this._createHeadersColGroupHtml(html, idx);
	html[idx++] =           "<tr>";
	idx = this._createHeadersHtml(html, idx);
	html[idx++] =           "</tr>";
	/*
	html[idx++] =           "<tr>";
	idx = this._createAllDayHtml(html, idx);
    html[idx++] =           "</tr>";
    */
	html[idx++] =         "</table>";
	html[idx++] =       "</div>";
	html[idx++] =     "</td>";
	html[idx++] =   "</tr>";
	html[idx++] =   "<tr><td colspan="+(this._numDays+1)+" class=calendar_header_allday_separator></td></tr>";
	html[idx++] =   "<tr>";
	html[idx++] =     "<td>";	
	html[idx++] =         "<div id='"+this._bodyDivId+"' class=calendar_body style='overflow-x:hidden; overflow:-moz-scrollbars-vertical;'>";
	html[idx++] =           "<table id='"+this._bodyTableId+"' class=calendar_grid_table>";
	idx = this._createBodyColGroupHtml(html, idx);
	html[idx++] =             "<tr>";
	idx = this._createHoursHtml(html, idx);
	idx = this._createDaysHtml(html, idx);
	html[idx++] =             "</tr>";
	html[idx++] =           "</table>";
	html[idx++] =         "</div>";
	html[idx++] =       "</td>";
	html[idx++] =    "</tr>";
	html[idx++] = "</table>";
	
	html.length = idx;

	this.getHtmlElement().innerHTML = html.join("");
	
	var act = new AjxTimedAction();
	act.method = ZmCalDayView._scrollTo8AM;
	act.params.add(this);
	AjxTimedAction.scheduleAction(act,1);
	
}

ZmCalDayView.prototype._computeMaxCols =
function(layout, max) {
	//DBG.println("compute max cols for "+layout.appt.id+" col="+layout.col);
	layout.maxcol = Math.max(layout.col, layout.maxcol, max);
	for (var r in layout.right) {
		var m = this._computeMaxCols(layout.right[r], layout.maxcol);
		layout.maxcol = Math.max(layout.col, m);
	}
	//DBG.println("max cols for "+layout.appt.id+" was: "+layout.maxcol);	
	return layout.maxcol;	
}

/*
 * compute appt layout for appts that aren't all day
 */
ZmCalDayView.prototype._computeApptLayout =
function() {
//	DBG.println("_computeApptLayout");
	var layouts = this._layouts = new Array();
	var list = this.getList();
	if (!list) return;
	
	var size = list.size();
	if (size == 0) return;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);

		if (ao.isAllDayEvent()) {
			continue;
		}

		var st = ao.getStartTime();
		var et = ao.getEndTime();		
		var newLayout = { appt: ao, col: 0, maxcol: -1, left: [], right: [] };
		// look for overlapping appts
		var overlap = [];
		var overlappingCol = [];
		for (var j=0; j < layouts.length; j++) {
			var layout = layouts[j];
			if (ao.isOverlapping(layout.appt)) {
				overlap.push(layout);
				overlappingCol[layout.col] = true;
				// while we overlap, update our col
				while (overlappingCol[newLayout.col]) {
					newLayout.col++;
				}
			}
		}

		// figure out who is left and who is right
		for (var c in overlap) {
			var l = overlap[c];
			if (newLayout.col < l.col) {
				newLayout.right.push(l);
				l.left.push(newLayout);
			} else {
				newLayout.left.push(l);
				l.right.push(newLayout);
			}
		}
		layouts.push(newLayout);
	}
	
	// compute maxcols
	for (var i=0; i < layouts.length; i++) {
		this._computeMaxCols(layouts[i], -1);
	}
	
	/*
	for (var i=0; i < layouts.length; i++) {
		DBG.println("----- layout "+i);
		DBG.dumpObj(layouts[i]);
	}
	*/
}

/*
 * add a new all day appt row layout slot and return it
 */
ZmCalDayView.prototype._addAllDayApptRowLayout =
function() {
	var data = [];
	for (var i=0; i < this._numDays; i++) {
		// free is set to true if slot is available, false otherwise
		// appt is set to the _allDayAppts data in the first slot only (if appt spans days)
		data[i] = { free: true, data: null };
	}
	this._allDayApptsRowLayouts.push(data);
	return data;
}


/**
 * take the appt data in reserve the slots
 */
ZmCalDayView.prototype._fillAllDaySlot = 
function(row, dayIndex, data) {
	for (var j=0; j < data.numDays; j++) {
		row[dayIndex+j].data = j==0 ? data : null;
		row[dayIndex+j].free = false;
	}
}

/**
 * find a slot and fill it in, adding new rows if needed
 */
ZmCalDayView.prototype._findAllDaySlot = 
function(dayIndex, data) {
	var rows = this._allDayApptsRowLayouts;
	var row = null;
	for (var i=0; i < rows.length; i++) {
		row = rows[i];
		for (var j=0; j < data.numDays; j++) {
			if (!row[dayIndex+j].free) {
				row = null;
				break;
			}
		}
		if (row != null)	break;
	}
	if (row == null)
		row = this._addAllDayApptRowLayout();

	this._fillAllDaySlot(row, dayIndex, data);	
}

/*
 * compute layout info for all day appts
 */
ZmCalDayView.prototype._computeAllDayApptLayout =
function() {
	var adlist = this._allDayApptsList;
	adlist.sort(ZmAppt.compareByTimeAndDuration);
	
	for (var i=0; i < adlist.length; i++) {
		var appt = adlist[i];
		var data = this._allDayAppts[appt.getUniqueId()];
		if (data) {
			var day = this._getDayForDate(new Date(data.startTime));
			if (day) {
				this._findAllDaySlot(day.index, data);
				/*
				DBG.println("day index = "+day.index);
				DBG.println("colspan = "+data.numDays);
				DBG.println("includesFirst = "+data.isStartInView);
				DBG.println("includesLast = "+data.isEndInView);
				*/
			}
		}
	}
	this._layoutAllDayAppts();
}

ZmCalDayView.prototype._layoutAllDayAppts =
function() {
	var rows = this._allDayApptsRowLayouts;

	var table = Dwt.getDomObj(this.getDocument(), this._headerTableId);
	
	for (var i=0; i < rows.length; i++) {
		var row = rows[i];
		// add new row
		var tr = table.insertRow(-1);
		// add blank left cell
		var td = tr.insertCell(-1);
		td.innerHTML = "&nbsp;" // cell under the year
		for (var j=0; j < this._numDays; j++) {
			var slot = row[j];
			if (slot.free) {
				var td = tr.insertCell(-1);
				td.className = "calendar_header_allday_td";				
				td.innerHTML = "&nbsp;"
			} else if (slot.data) {
				var td = tr.insertCell(-1);
				td.className = "calendar_header_allday_td";
				td.colSpan = slot.data.numDays;
				td.appendChild(slot.data.div);
			}
		}
		// add gutter cell
		var td = tr.insertCell(-1);
		td.innerHTML = "&nbsp;" // gutter
	}
}

ZmCalDayView._getApptWidthPercent = 
function(numCols) {
	switch(numCols) {
		case 1: return 1;
		case 2: return 0.8;
		case 3: return 0.6;
		case 4: return 0.4;
		default: return 0.4;
	}
}


ZmCalDayView.prototype._layoutAppts =
function() {

	var doc = this.getDocument();
	
	// for starting x and width	
	var data = this._hours[0];
	var daySize = Dwt.getSize(Dwt.getDomObj(doc, this._days[0].bodyDivId));
	var apptW = daySize.x;
	var dayHeight = daySize.y;
	
	//apptW -= 5;

//	DBG.println("_layoutAppts: dayHeight="+dayHeight);

	var doc = this.getDocument();
	for (var i=0; i < this._layouts.length; i++) {
		var layout = this._layouts[i];
		var awidth = apptW;
		var ao = layout.appt;
		var apptDiv = Dwt.getDomObj(doc, this._getItemId(ao));
		if (apptDiv) {
			// only need to do this first time through
			if (!layout.h) {
				var sd = ao.getStartDate();
				var et = ao.getEndTime();
				var ed;
				
				var day = this._getDayForDate(sd);
				layout.lastDay = day.lastDay;
				if (et >= day.endDate.getTime()) {
					ed = day.endDate;
				} else {
					ed = ao.getEndDate();
				}
				layout.y = this._getYfromDate(sd, true, dayHeight);
				var endY = this._getYfromDate(ed, false, dayHeight);
				layout.h = endY - layout.y + 1;					
				
				//DBG.println("---- sd="+sd+" ed="+ed);
				//DBG.println("_layoutAppts: "+apptDiv);
				//DBG.println("_layoutAppts: layout.h="+layout.h+" layout.y="+layout.y+ " endY="+endY);
			}
			if (layout.lastDay && AjxEnv.isIE) awidth -= 20;
			var w = Math.floor(awidth*ZmCalDayView._getApptWidthPercent(layout.maxcol+1));
			var xinc = layout.maxcol ? ((awidth - w) / layout.maxcol) : 0; // n-1
			var x = xinc * layout.col;
			//DBG.println("_layoutAppts: "+ao);
			//DBG.println("_layoutAppts: x="+x+" y="+layout.y+" w="+w+" h="+layout.h);

			/*
			var pstatus = ao.getParticipationStatus();
			if ((layout.maxcol > 0) && (pstatus != ZmAppt.PSTATUS_DECLINED && pstatus != ZmAppt.PSTATUS_TENTATIVE)) {
				this._setOpacity(apptDiv, 95);
			}
			*/
			
			// MOW: now we're setting the width and height of an inner div
			//		this allows the clipping and border to work properly
			//		so that appts are limited to the correct height
//			Dwt.setBounds(apptDiv, 
//							x + ZmCalDayView._apptXFudge, 
//							layout.y + ZmCalDayView._apptYFudge,
//							w + ZmCalDayView._apptWidthFudge, 
//							layout.h + ZmCalDayView._apptHeightFudge
//						);
			Dwt.setLocation(apptDiv, 
							x + ZmCalDayView._apptXFudge, 
							layout.y + ZmCalDayView._apptYFudge
						);

			// get the inner div that should be sized and set its width/height
			var apptBodyDiv = Dwt.getDomObj(doc, this._getItemId(ao) + "_body");
			Dwt.setSize(	apptBodyDiv,
							w + ZmCalDayView._apptWidthFudge, 
							layout.h + ZmCalDayView._apptHeightFudge
						);

		}
	}
}

ZmCalDayView.prototype._getYfromDate = 
function(d, isStart, dayHeight) {
	var h = d.getHours();
	var m = d.getMinutes();
	if (!isStart) {
		if (m == 0) {
			if (h > 0) {
				h--;
				m = 59;
			}
		} else {
			m--;
		}
	}
	var perHour = dayHeight/24;
	return Math.floor(h*perHour + (m/60)*perHour);
}

ZmCalDayView.prototype._layout =
function() {

	DBG.println("in layout!");
	var doc = this.getDocument();
	
	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;
	
	if (width == 0 || height == 0) {
		return;
	}

	this._needFirstLayout = false;

	var doc = this.getDocument();
	
	var headerElement = Dwt.getDomObj(doc, this._headerDivId);
	var headerSize = Dwt.getSize(headerElement);
	var headerHeight = headerSize.y;
	Dwt.setSize(headerElement, width, Dwt.DEFAULT);

	var headerTableElement = Dwt.getDomObj(doc, this._headerTableId);
	Dwt.setSize(headerTableElement, width, Dwt.DEFAULT);

	var bodyElement = Dwt.getDomObj(doc, this._bodyDivId);
	var bodyWidth = width;
	var bodyHeight = height - headerHeight -4;
	Dwt.setSize(bodyElement, bodyWidth, bodyHeight);
	//Dwt.setSize(bodyElement, Dwt.DEFAULT, height - headerHeight);	

	// size all the columns
	Dwt.setSize(Dwt.getDomObj(doc, this._headerGutterColId), 18, Dwt.DEFAULT);//gutter
	Dwt.setSize(Dwt.getDomObj(doc, this._headerHourColId), 40, Dwt.DEFAULT);
	Dwt.setSize(Dwt.getDomObj(doc, this._bodyHourColId), 40, Dwt.DEFAULT);	
	
	var fudge = 0;

	var tableWidth = 40;
	
	var totalWidth = width - fudge - 40;
	var colWidth = Math.floor(totalWidth/this._numDays);
		
	for (var i =0; i < this._numDays; i++) {
		tableWidth += colWidth;
		Dwt.setSize(Dwt.getDomObj(doc, this._days[i].headerColId), colWidth - (AjxEnv.isIE ? 0 : 4), Dwt.DEFAULT);	
		Dwt.setSize(Dwt.getDomObj(doc, this._days[i].bodyColId), colWidth, Dwt.DEFAULT);	
	}
	
	var bodyTableElement = Dwt.getDomObj(doc, this._bodyTableId);
	Dwt.setSize(bodyElement, tableWidth, Dwt.DEFAULT);
	this._layoutAppts();

	return;
}

ZmCalDayView.prototype._controlListener =
function(ev) {
	//if (ev.oldWidth == ev.newWidth) return;
	try {	
		this._layout();
	} catch(ex) {
		DBG.dumpObj(ex);
	}
}

ZmCalDayView.prototype._apptSelected =
function() {
	this._clearSelectedTime();
}

ZmCalDayView._ondblclickHandler =
function (ev){
	ev = DwtUiEvent.getEvent(ev);
	ev._isDblClick = true;
	ZmCalDayView._onclickHandler(ev);
};

ZmCalDayView._onclickHandler =
function(event) {
	var event = DwtUiEvent.getEvent(event);
	var element = DwtUiEvent.getTargetWithProp(event, "id");
	if (!element) return;
	var id = element.id;
	var data = ZmCalDayView._idToData[id];
	var view = data.view;

	if (view) {
		if (!view._selectionEvent)
			view._selectionEvent = new DwtSelectionEvent(true);
		var ev = view._selectionEvent;
		ev._isDblClick = event._isDblClick;
	   	ev.item = view;
	   	ev.detail = new Date(view._days[data.day].date.getTime() + 
		   					(data.hour * AjxDateUtil.MSEC_PER_HOUR) +
						   	(data.top ? 0 : AjxDateUtil.MSEC_PER_HALF_HOUR));
	   	ev.force = false;
	   	view.notifyListeners(ZmCalBaseView.TIME_SELECTION, view._selectionEvent);
		ev._isDblClick = false;
	   	//DBG.dumpObj(ev);
	}		
}

ZmCalDayView._oncontextmenuHandler =
function(event) {
	var event = DwtUiEvent.getEvent(event);
	var element = DwtUiEvent.getTargetWithProp(event, "id");
	if (!element) return;
	var id = element.id;
	var data = ZmCalDayView._idToData[id];
	var view = data.view;
	if (view) {
		if (!view._contextMenuEvent) {
			view._contextMenuEvent = new DwtUiEvent(true);
		}
		var ev = view._contextMenuEvent;
	   	ev.item = view;
	   	ev.detail = new Date(view._days[data.day].date.getTime() + 
		   					(data.hour * AjxDateUtil.MSEC_PER_HOUR) +
						   	(data.top ? 0 : AjxDateUtil.MSEC_PER_HALF_HOUR));
	   	view.notifyListeners(DwtEvent.ONCONTEXTMENU, view._contextMenuEvent);
	}		
}

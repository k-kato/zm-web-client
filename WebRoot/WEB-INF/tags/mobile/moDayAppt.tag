<%@ tag body-content="empty" %>
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZAppointmentHit" %>
<%@ attribute name="start" rtexprvalue="true" required="true"%>
<%@ attribute name="end" rtexprvalue="true" required="true"%>
<%@ attribute name="selected" rtexprvalue="true" required="false"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setTimeZone value="${timezone}"/>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
<fmt:message var="noSubject" key="noSubject"/>
<c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
<mo:calendarUrl appt="${appt}" var="apptUrl"/>

<c:choose>
    <c:when test="${appt.allDay}">
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>

        <div <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright}"</c:if>
                class='zo_allday_appt ${color}${needsAction ? 'Dark' : 'Light'}' onclick='window.location="${zm:jsEncode(apptUrl)}"'>
            <div class='zo_appt_text'>
                <a href="${apptUrl}">${fn:escapeXml(subject)}</a>
            </div>
        </div>
    </c:when>
    <c:otherwise>
        <div class='${color}${appt.partStatusNeedsAction ? '' : 'Bg'} zo_day_appt' onclick='window.location="${zm:jsEncode(apptUrl)}"'>
            <div class='zo_appt_text'>
                ${fn:escapeXml(subject)}
            </div>
        </div>
    </c:otherwise>
</c:choose>

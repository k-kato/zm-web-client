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

function ZmMimeTable() {
};

// IGNORE means the client will not display these attachment types to the user
ZmMimeTable.APP					= "application";
ZmMimeTable.APP_ADOBE_PDF		= "application/pdf";
ZmMimeTable.APP_ADOBE_PS		= "application/postscript";
ZmMimeTable.APP_APPLE_DOUBLE 	= "application/applefile";		// IGNORE
ZmMimeTable.APP_EXE				= "application/exe";
ZmMimeTable.APP_MS_DOWNLOAD		= "application/x-msdownload";
ZmMimeTable.APP_MS_EXCEL		= "application/vnd.ms-excel";
ZmMimeTable.APP_MS_PPT			= "application/vnd.ms-powerpoint";
ZmMimeTable.APP_MS_PROJECT		= "application/vnd.ms-project";
ZmMimeTable.APP_MS_TNEF			= "application/ms-tnef"; 		// IGNORE
ZmMimeTable.APP_MS_TNEF2 		= "application/vnd.ms-tnef"; 	// IGNORE (added per bug 2339)
ZmMimeTable.APP_MS_VISIO		= "application/vnd.visio";
ZmMimeTable.APP_MS_WORD			= "application/msword";
ZmMimeTable.APP_OCTET_STREAM	= "application/octet-stream";
ZmMimeTable.APP_ZIP				= "application/zip";
ZmMimeTable.APP_ZIP2			= "application/x-zip-compressed";
ZmMimeTable.AUDIO				= "audio";
ZmMimeTable.AUDIO_WAV			= "audio/x-wav";
ZmMimeTable.AUDIO_MP3			= "audio/mpeg";
ZmMimeTable.IMG					= "image";
ZmMimeTable.IMG_GIF				= "image/gif";
ZmMimeTable.IMG_JPEG			= "image/jpeg";
ZmMimeTable.IMG_PNG				= "image/png";
ZmMimeTable.IMG_TIFF			= "image/tiff";
ZmMimeTable.MSG_RFC822			= "message/rfc822";
ZmMimeTable.MULTI_ALT			= "multipart/alternative"; 		// IGNORE
ZmMimeTable.MULTI_MIXED			= "multipart/mixed"; 			// IGNORE
ZmMimeTable.MULTI_RELATED		= "multipart/related"; 			// IGNORE
ZmMimeTable.TEXT				= "text";
ZmMimeTable.TEXT_RTF			= "text/enriched";
ZmMimeTable.TEXT_HTML			= "text/html";
ZmMimeTable.TEXT_CAL			= "text/calendar"; 				// IGNORE
ZmMimeTable.TEXT_JAVA			= "text/x-java";
ZmMimeTable.TEXT_PLAIN			= "text/plain";
ZmMimeTable.TEXT_XML			= "text/xml";
ZmMimeTable.VIDEO				= "video";
ZmMimeTable.VIDEO_WMV			= "video/x-ms-wmv";

ZmMimeTable._table = new Object();

// only add types which are NOT ignored by the client	
ZmMimeTable._table[ZmMimeTable.APP]					= {desc: ZmMsg.unknownBinaryType, image: "ExeDoc", imageLarge: "ExeDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PDF]		= {desc: ZmMsg.adobePdfDocument, image: "PDFDoc", imageLarge: "PDFDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PS]		= {desc: ZmMsg.adobePsDocument, image: "GenericDoc", imageLarge: "GenericDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_EXE]				= {desc: ZmMsg.application, image: "ExeDoc", imageLarge: "ExeDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_DOWNLOAD]		= {desc: ZmMsg.msDownload, image: "ExeDoc", imageLarge: "ExeDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_EXCEL]		= {desc: ZmMsg.msExcelDocument, image: "MSExcelDoc", imageLarge: "MSExcelDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_PPT]			= {desc: ZmMsg.msPPTDocument, image: "MSPowerpointDoc", imageLarge: "MSPowerpointDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_PROJECT]		= {desc: ZmMsg.msProjectDocument, image: "MSProjectDoc", imageLarge: "MSProjectDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_VISIO]		= {desc: ZmMsg.msVisioDocument, image: "MSVisioDoc", imageLarge: "MSVisioDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_MS_WORD]			= {desc: ZmMsg.msWordDocument, image: "MSWordDoc", imageLarge: "MSWordDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_OCTET_STREAM]	= {desc: ZmMsg.unknownBinaryType, image: "UnknownDoc", imageLarge: "UnknownDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_ZIP]				= {desc: ZmMsg.zipFile, image: "ZipDoc", imageLarge: "ZipDoc_48"};
ZmMimeTable._table[ZmMimeTable.APP_ZIP2]			= {desc: ZmMsg.zipFile, image: "ZipDoc", imageLarge: "ZipDoc_48"};
ZmMimeTable._table[ZmMimeTable.AUDIO]				= {desc: ZmMsg.audio, image: "AudioDoc", imageLarge: "Doc_48"};
ZmMimeTable._table[ZmMimeTable.AUDIO_WAV]			= {desc: ZmMsg.waveAudio, image: "AudioDoc", imageLarge: "AudioDoc_48"};
ZmMimeTable._table[ZmMimeTable.AUDIO_MP3]			= {desc: ZmMsg.mp3Audio, image: "AudioDoc", imageLarge: "AudioDoc_48"};
ZmMimeTable._table[ZmMimeTable.VIDEO]				= {desc: ZmMsg.video, image: "VideoDoc", imageLarge: "VideoDoc_48"};
ZmMimeTable._table[ZmMimeTable.VIDEO_WMV]			= {desc: ZmMsg.msWMV, image: "VideoDoc", imageLarge: "VideoDoc_48"};
ZmMimeTable._table[ZmMimeTable.IMG]					= {desc: ZmMsg.image, image: "ImageDoc", imageLarge: "ImageDoc_48"};
ZmMimeTable._table[ZmMimeTable.IMG_GIF]				= {desc: ZmMsg.gifImage, image: "ImageDoc", imageLarge: "ImageDoc_48"};
ZmMimeTable._table[ZmMimeTable.IMG_JPEG]			= {desc: ZmMsg.jpegImage, image: "ImageDoc", imageLarge: "ImageDoc_48"};
ZmMimeTable._table[ZmMimeTable.IMG_PNG]				= {desc: ZmMsg.pngImage, image: "ImageDoc", imageLarge: "ImageDoc_48"};
ZmMimeTable._table[ZmMimeTable.IMG_TIFF]			= {desc: ZmMsg.tiffImage, image: "ImageDoc", imageLarge: "ImageDoc_48"};
ZmMimeTable._table[ZmMimeTable.MSG_RFC822]			= {desc: ZmMsg.mailMessage, image: "MessageDoc", imageLarge: "MessageDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT]				= {desc: ZmMsg.textDocuments, image: "GenericDoc", imageLarge: "GenericDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT_RTF]			= {desc: ZmMsg.enrichedText, image: "GenericDoc", imageLarge: "GenericDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT_HTML]			= {desc: ZmMsg.htmlDocument, image: "HtmlDoc", imageLarge: "HtmlDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT_JAVA]			= {desc: ZmMsg.javaSource, image: "GenericDoc", imageLarge: "GenericDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT_PLAIN]			= {desc: ZmMsg.textFile, image: "GenericDoc", imageLarge: "GenericDoc_48"};
ZmMimeTable._table[ZmMimeTable.TEXT_XML]			= {desc: ZmMsg.xmlDocument, image: "GenericDoc", imageLarge: "GenericDoc_48"};

ZmMimeTable.getInfo =
function(type, createIfUndefined) {
	var entry = ZmMimeTable._table[type];
	if (!entry && createIfUndefined) {
		entry = ZmMimeTable._table[type] = {desc: type, image: "UnknownDoc", imageLarge: "UnknownDoc_48"};
	}
	if (entry) {
		if (!entry.type)
			entry.type = type;
	} else {
		// otherwise, check if main category is in table
		var baseType = type.split("/")[0];
		if (baseType)
			entry = ZmMimeTable._table[baseType];
	}
	return entry;
};

ZmMimeTable.isIgnored = 
function(type) {
	if (type == ZmMimeTable.MULTI_ALT || 
		type == ZmMimeTable.MULTI_MIXED || 
		type == ZmMimeTable.TEXT_CAL || 
		type == ZmMimeTable.MULTI_RELATED || 
		/* XXX: we have licensing issues so gotta show these for now
		type == ZmMimeTable.APP_MS_TNEF ||
		type == ZmMimeTable.APP_MS_TNEF2 || 
		*/
		type == ZmMimeTable.APP_APPLE_DOUBLE)
	{
		return true;
	}
	return false;
};

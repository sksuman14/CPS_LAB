import 'dart:io' show File, Directory, Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/services.dart' show rootBundle;

class DownloadManager {
  static final Map<String, Map<String, String>> sensorFiles = {
  
    "DataLogger": {

      "datasheet": "assets/pdfs/Data_logger_datasheet.pdf",
    },
    "ACTIVITY": {
  "datasheet": "assets/pdfs/ACTIVITY.pdf",
},
"STTS751": {
  "datasheet": "assets/pdfs/STTS751.pdf",
},
"BME680": {
  "datasheet": "assets/pdfs/BME680.pdf",
},
"LIS3DH": {
  "datasheet": "assets/pdfs/LIS3DH.pdf",
},
"W25QXX": {
  "datasheet": "assets/pdfs/W25QXX.pdf",
},
"BUZZER": {
  "datasheet": "assets/pdfs/BUZZER.pdf",
},
"RELAY": {
  "datasheet": "assets/pdfs/RELAY.pdf",
},
"BLEKIT": {
  "datasheet": "assets/pdfs/BLEKIT.pdf",
},
"BLENODE": {
  "datasheet": "assets/pdfs/BLENODE.pdf",
},
"FLASHTOOL": {
  "datasheet": "assets/pdfs/FLASHTOOL.pdf",
},
"LUX": {
  "datasheet": "assets/pdfs/LUX.pdf",
},
"HALL": {
  "datasheet": "assets/pdfs/HALL.pdf",
},
"IR": {
  "datasheet": "assets/pdfs/IR.pdf",
},
"TLV": {
  "datasheet": "assets/pdfs/TLV.pdf",
},
"VL": {
  "datasheet": "assets/pdfs/VL.pdf",
},
"UVLTR": {
  "datasheet": "assets/pdfs/UVLTR.pdf",
},
"GROOVE": {
  "datasheet": "assets/pdfs/GROOVE.pdf",
},
"Gateway": {
  "datasheet": "assets/pdfs/BLE_GATEWAY_Datasheet.pdf",
},


    
  };

  static Future<void> downloadFile({
    required BuildContext context,
    required String sensorKey,
    required String fileType,
  }) async {
    final filePath = sensorFiles[sensorKey]?[fileType];
    if (filePath == null) {
      _toast(context, "File not found");
      return;
    }

    if (kIsWeb) {
      final webPath = filePath.startsWith("assets/")
          ? filePath.replaceFirst("assets/", "assets/assets/")
          : filePath;
      final fullUrl = Uri.base.resolve(webPath).toString();

      if (await canLaunchUrl(Uri.parse(fullUrl))) {
        await launchUrl(Uri.parse(fullUrl));
      } else {
        _toast(context, "Could not open file in browser");
      }
      return;
    }

    try {
      final byteData = await rootBundle.load(filePath);
      final bytes = byteData.buffer.asUint8List();

      Directory? dir;
      if (Platform.isAndroid) {
        dir = Directory("/storage/emulated/0/Download");
      } else {
        dir = await getApplicationDocumentsDirectory();
      }

      final file = File('${dir.path}/${sensorKey}_$fileType.pdf');
      await file.writeAsBytes(bytes);

      _toast(context, "Saved to ${file.path}");
    } catch (e) {
      _toast(context, "Error: $e");
    }
  }

  static void _toast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }
}